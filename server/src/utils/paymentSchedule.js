import db from "../models/db.js";

// Generate payment schedules for a member
export const generatePaymentSchedules = (
  memberId,
  membershipStart,
  membershipEnd,
  membershipFee,
  membershipType,
) => {
  const schedules = [];
  const startDate = new Date(membershipStart);
  const endDate = new Date(membershipEnd);

  let currentDate = new Date(startDate);

  // Determine interval based on membership type
  let monthsInterval = 1;
  if (membershipType === "quarterly") monthsInterval = 3;
  if (membershipType === "yearly") monthsInterval = 12;

  while (currentDate <= endDate) {
    schedules.push({
      member_id: memberId,
      due_date: currentDate.toISOString().split("T")[0],
      expected_amount: membershipFee,
      status: "pending",
    });

    // Move to next payment date
    currentDate.setMonth(currentDate.getMonth() + monthsInterval);
  }

  return schedules;
};

// Insert payment schedules into database
export const createPaymentSchedules = (schedules) => {
  const stmt = db.prepare(`
    INSERT INTO payment_schedules (member_id, due_date, expected_amount, status)
    VALUES (?, ?, ?, ?)
  `);

  schedules.forEach((schedule) => {
    stmt.run(
      schedule.member_id,
      schedule.due_date,
      schedule.expected_amount,
      schedule.status,
    );
  });
};

// Calculate next payment due date
export const calculateNextPaymentDue = (lastPaymentDate, membershipType) => {
  const nextDate = new Date(lastPaymentDate);

  if (membershipType === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else if (membershipType === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (membershipType === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  }

  return nextDate.toISOString().split("T")[0];
};

// Update payment status for all members
export const updatePaymentStatuses = () => {
  const today = new Date().toISOString().split("T")[0];

  // Update overdue days in payment schedules
  db.prepare(
    `
    UPDATE payment_schedules
    SET days_overdue = CAST((julianday('${today}') - julianday(due_date)) AS INTEGER)
    WHERE status = 'pending' AND due_date < '${today}'
  `,
  ).run();

  // Update member payment status based on schedules
  const members = db
    .prepare(
      `
    SELECT m.id, m.next_payment_due
    FROM members m
    WHERE m.status = 'active'
  `,
    )
    .all();

  members.forEach((member) => {
    if (!member.next_payment_due) return;

    const dueDate = new Date(member.next_payment_due);
    const todayDate = new Date(today);
    const daysUntilDue = Math.ceil(
      (dueDate - todayDate) / (1000 * 60 * 60 * 24),
    );

    let paymentStatus = "current";

    if (daysUntilDue < 0) {
      if (Math.abs(daysUntilDue) >= 15) {
        paymentStatus = "severely_overdue";
      } else {
        paymentStatus = "overdue";
      }
    } else if (daysUntilDue === 0) {
      paymentStatus = "due_today";
    } else if (daysUntilDue <= 7) {
      paymentStatus = "pending";
    }

    db.prepare(
      `
      UPDATE members
      SET payment_status = ?
      WHERE id = ?
    `,
    ).run(paymentStatus, member.id);
  });
};

// Get payment statistics
export const getPaymentStats = () => {
  const today = new Date().toISOString().split("T")[0];

  // Payments due today
  const dueToday = db
    .prepare(
      `
    SELECT COUNT(*) as count, COALESCE(SUM(expected_amount), 0) as amount
    FROM payment_schedules
    WHERE status = 'pending' AND due_date = ?
  `,
    )
    .get(today);

  // Overdue payments
  const overdue = db
    .prepare(
      `
    SELECT COUNT(*) as count, COALESCE(SUM(expected_amount), 0) as amount
    FROM payment_schedules
    WHERE status = 'pending' AND due_date < ?
  `,
    )
    .get(today);

  // Upcoming payments (next 7 days)
  const upcoming = db
    .prepare(
      `
    SELECT COUNT(*) as count, COALESCE(SUM(expected_amount), 0) as amount
    FROM payment_schedules
    WHERE status = 'pending' AND due_date > ? AND due_date <= date(?, '+7 days')
  `,
    )
    .get(today, today);

  // Monthly collection (current month)
  const monthlyCollection = db
    .prepare(
      `
    SELECT COALESCE(SUM(amount), 0) as amount
    FROM payments
    WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now')
  `,
    )
    .get();

  // Expected monthly collection
  const expectedMonthly = db
    .prepare(
      `
    SELECT COALESCE(SUM(membership_fee), 0) as amount
    FROM members
    WHERE status = 'active'
  `,
    )
    .get();

  // Collection rate
  const collectionRate =
    expectedMonthly.amount > 0
      ? Math.round((monthlyCollection.amount / expectedMonthly.amount) * 100)
      : 0;

  return {
    dueToday: {
      count: dueToday.count,
      amount: dueToday.amount,
    },
    overdue: {
      count: overdue.count,
      amount: overdue.amount,
    },
    upcoming: {
      count: upcoming.count,
      amount: upcoming.amount,
    },
    monthlyCollection: monthlyCollection.amount,
    expectedMonthly: expectedMonthly.amount,
    collectionRate,
  };
};
