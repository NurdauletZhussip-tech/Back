const prisma = require('../prismaClient');

async function seed() {
  const badges = [
    {
      name: 'First Lesson',
      description: 'Completed first lesson',
      criteria_type: 'lessons_completed',
      criteria_value: 1,
      icon_url: '/assets/badges/first_lesson.png'
    },
    {
      name: '5 Lessons',
      description: 'Completed 5 lessons',
      criteria_type: 'lessons_completed',
      criteria_value: 5,
      icon_url: '/assets/badges/5_lessons.png'
    },
    {
      name: '100 XP',
      description: 'Earned 100 XP',
      criteria_type: 'total_xp',
      criteria_value: 100,
      icon_url: '/assets/badges/100_xp.png'
    },
    {
      name: '7 Day Streak',
      description: '7 day streak achieved',
      criteria_type: 'streak_days',
      criteria_value: 7,
      icon_url: '/assets/badges/7day_streak.png'
    }
  ];

  for (const b of badges) {
    const existing = await prisma.badges.findUnique({ where: { name: b.name } });
    if (!existing) {
      await prisma.badges.create({ data: b });
      console.log('Inserted badge:', b.name);
    } else {
      console.log('Badge exists:', b.name);
    }
  }
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

