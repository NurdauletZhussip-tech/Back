const bcrypt = require('bcrypt');
const prisma = require('../prismaClient');
const LeaderboardService = require('../services/leaderboardService');

const DEMO_PARENT_EMAIL = 'demo.parent@literacybee.local';
const DEMO_PASSWORD = 'demo12345';
const DEMO_PIN = '1234';
let supportsExerciseDifficulty = false;

const units = [
  {
    order_index: 1,
    title: 'Letters and Sounds',
    description: 'Simple phonics practice for first reading steps',
    lessons: [
      {
        order_index: 1,
        title: 'Letter A Sounds',
        description: 'Hear, say, and read words with A',
        xp_reward: 50,
        exercises: [
          ['phonics', 'What sound does the letter A make?', 'a', 10, 1],
          ['phonics', 'What letter starts the word apple?', 'a', 10, 2],
          ['sight_words', 'Read the word: APPLE', 'apple', 15, 3]
        ]
      },
      {
        order_index: 2,
        title: 'Letter O Sounds',
        description: 'Practice short O with easy words',
        xp_reward: 50,
        exercises: [
          ['phonics', 'What sound does the letter O make?', 'o', 10, 1],
          ['sight_words', 'Read the word: DOG', 'dog', 15, 2],
          ['vocabulary', 'What word means a round toy you can throw?', 'ball', 10, 3]
        ]
      }
    ]
  },
  {
    order_index: 2,
    title: 'Everyday Words',
    description: 'Vocabulary from home, school, and play',
    lessons: [
      {
        order_index: 3,
        title: 'Home Words',
        description: 'Read simple words about things at home',
        xp_reward: 60,
        exercises: [
          ['vocabulary', 'What do you sleep in?', 'bed', 10, 1],
          ['vocabulary', 'What do you sit on?', 'chair', 10, 2],
          ['sight_words', 'Read the word: HOUSE', 'house', 15, 3],
          ['handwriting', 'Type the word: cup', 'cup', 10, 4]
        ]
      },
      {
        order_index: 4,
        title: 'School Words',
        description: 'Words from a classroom day',
        xp_reward: 60,
        exercises: [
          ['vocabulary', 'What do you read?', 'book', 10, 1],
          ['vocabulary', 'What do you write with?', 'pencil', 10, 2],
          ['sight_words', 'Read the word: TEACHER', 'teacher', 15, 3],
          ['handwriting', 'Type the word: desk', 'desk', 10, 4]
        ]
      }
    ]
  },
  {
    order_index: 3,
    title: 'Reading Sentences',
    description: 'Tiny sentences for confidence and fluency',
    lessons: [
      {
        order_index: 5,
        title: 'Animals',
        description: 'Read and understand animal words',
        xp_reward: 70,
        exercises: [
          ['vocabulary', 'Which animal says meow?', 'cat', 10, 1],
          ['vocabulary', 'Which animal says woof?', 'dog', 10, 2],
          ['sight_words', 'Complete: The cat can ___', 'run', 15, 3],
          ['phonics', 'What is the first sound in fish?', 'f', 10, 4]
        ]
      },
      {
        order_index: 6,
        title: 'Food Words',
        description: 'Practice words for snacks and meals',
        xp_reward: 70,
        exercises: [
          ['vocabulary', 'What fruit is red or green and crunchy?', 'apple', 10, 1],
          ['vocabulary', 'What do you drink from a cup?', 'water', 10, 2],
          ['sight_words', 'Read the word: BREAD', 'bread', 15, 3],
          ['handwriting', 'Type the word: milk', 'milk', 10, 4]
        ]
      }
    ]
  }
];

const demoChildren = [
  { name: 'Mia Reader', date_of_birth: '2018-04-12', completedLessons: 5, extraExercises: 2 },
  { name: 'Leo Words', date_of_birth: '2017-09-03', completedLessons: 4, extraExercises: 1 },
  { name: 'Ava Sounds', date_of_birth: '2019-01-25', completedLessons: 3, extraExercises: 0 },
  { name: 'Noah Letters', date_of_birth: '2016-11-18', completedLessons: 2, extraExercises: 1 }
];

function exerciseData([type, question, correct_answer, xp_value, order_index]) {
  const data = {
    type,
    question_data: { question },
    correct_answer,
    xp_value,
    order_index
  };
  if (supportsExerciseDifficulty) {
    data.difficulty = Math.min(3, Math.max(1, Math.ceil(order_index / 2)));
  }
  return data;
}

async function columnExists(tableName, columnName) {
  const rows = await prisma.$queryRaw`
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = ${tableName}
      AND column_name = ${columnName}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function upsertContent() {
  const lessonRecords = [];

  for (const unit of units) {
    const unitRecord = await prisma.units.upsert({
      where: { order_index: unit.order_index },
      update: {
        title: unit.title,
        description: unit.description,
        updated_at: new Date()
      },
      create: {
        title: unit.title,
        description: unit.description,
        order_index: unit.order_index
      }
    });

    for (const lesson of unit.lessons) {
      const lessonRecord = await prisma.lessons.upsert({
        where: { order_index: lesson.order_index },
        update: {
          unit_id: unitRecord.id,
          title: lesson.title,
          description: lesson.description,
          xp_reward: lesson.xp_reward,
          is_published: true,
          updated_at: new Date()
        },
        create: {
          unit_id: unitRecord.id,
          title: lesson.title,
          description: lesson.description,
          order_index: lesson.order_index,
          xp_reward: lesson.xp_reward,
          is_published: true
        }
      });

      await prisma.exercises.deleteMany({ where: { lesson_id: lessonRecord.id } });
      await prisma.exercises.createMany({
        data: lesson.exercises.map(exercise => ({
          lesson_id: lessonRecord.id,
          ...exerciseData(exercise)
        }))
      });

      const exercises = await prisma.exercises.findMany({
        where: { lesson_id: lessonRecord.id },
        orderBy: { order_index: 'asc' }
      });

      lessonRecords.push({ ...lessonRecord, exercises });
    }
  }

  return lessonRecords.sort((a, b) => a.order_index - b.order_index);
}

async function upsertDemoUsers(lessonRecords) {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  const [passwordHash, pinHash] = await Promise.all([
    bcrypt.hash(DEMO_PASSWORD, saltRounds),
    bcrypt.hash(DEMO_PIN, saltRounds)
  ]);

  const parent = await prisma.users.upsert({
    where: { email: DEMO_PARENT_EMAIL },
    update: {
      name: 'Demo Parent',
      password_hash: passwordHash,
      email_verified: true,
      role: 'parent',
      updated_at: new Date()
    },
    create: {
      email: DEMO_PARENT_EMAIL,
      password_hash: passwordHash,
      email_verified: true,
      role: 'parent',
      name: 'Demo Parent'
    }
  });

  const allExercises = lessonRecords.flatMap(lesson => lesson.exercises);

  for (const childSeed of demoChildren) {
    let child = await prisma.users.findFirst({
      where: {
        parent_id: parent.id,
        role: 'child',
        name: childSeed.name
      }
    });

    if (!child) {
      child = await prisma.users.create({
        data: {
          parent_id: parent.id,
          role: 'child',
          name: childSeed.name,
          date_of_birth: new Date(childSeed.date_of_birth),
          pin: pinHash
        }
      });
    } else {
      child = await prisma.users.update({
        where: { id: child.id },
        data: {
          date_of_birth: new Date(childSeed.date_of_birth),
          pin: pinHash,
          updated_at: new Date()
        }
      });
    }

    await prisma.exercise_attempts.deleteMany({ where: { child_id: child.id } });
    await prisma.progress.deleteMany({ where: { child_id: child.id } });
    await prisma.streaks.deleteMany({ where: { child_id: child.id } });

    const completedLessons = lessonRecords.slice(0, childSeed.completedLessons);
    for (const lesson of completedLessons) {
      await prisma.progress.create({
        data: {
          child_id: child.id,
          lesson_id: lesson.id,
          completed: true,
          score: 100,
          completed_at: new Date()
        }
      });

      await prisma.exercise_attempts.createMany({
        data: lesson.exercises.map(exercise => ({
          child_id: child.id,
          exercise_id: exercise.id,
          correct: true,
          xp_earned: exercise.xp_value || 0
        }))
      });
    }

    const bonusExercises = allExercises
      .filter(exercise => !completedLessons.some(lesson => lesson.id === exercise.lesson_id))
      .slice(0, childSeed.extraExercises);

    if (bonusExercises.length > 0) {
      await prisma.exercise_attempts.createMany({
        data: bonusExercises.map(exercise => ({
          child_id: child.id,
          exercise_id: exercise.id,
          correct: true,
          xp_earned: exercise.xp_value || 0
        }))
      });
    }

    await prisma.streaks.create({
      data: {
        child_id: child.id,
        current_streak: Math.max(1, childSeed.completedLessons),
        longest_streak: Math.max(1, childSeed.completedLessons + 1),
        last_activity_date: new Date()
      }
    });
  }

  return parent;
}

async function seed() {
  supportsExerciseDifficulty = await columnExists('exercises', 'difficulty');
  const lessonRecords = await upsertContent();
  const parent = await upsertDemoUsers(lessonRecords);
  await LeaderboardService.invalidate();

  console.log(`Seeded ${units.length} units, ${lessonRecords.length} lessons, and ${demoChildren.length} demo children.`);
  console.log(`Demo parent login: ${DEMO_PARENT_EMAIL}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log(`Demo child PIN: ${DEMO_PIN}`);
  console.log(`Demo parent id: ${parent.id}`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
