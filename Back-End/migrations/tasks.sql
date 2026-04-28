INSERT INTO lessons (title, description, order_index, xp_reward) VALUES
('Letter A Sounds', 'Learn the sound and letter A', 1, 50),
('Simple Words with A', 'Reading basic words with A', 2, 60),
('Letter O and Words', 'Sound O and simple words', 3, 50)
ON CONFLICT DO NOTHING;

INSERT INTO exercises (lesson_id, type, question_data, correct_answer, xp_value, order_index) VALUES

((SELECT id FROM lessons WHERE title = 'Letter A Sounds' LIMIT 1), 'phonics', 
 '{"question": "What sound does the letter A make?"}', 'a', 10, 1),

((SELECT id FROM lessons WHERE title = 'Letter A Sounds' LIMIT 1), 'phonics', 
 '{"question": "What letter is this? A"}', 'a', 10, 2),

((SELECT id FROM lessons WHERE title = 'Letter A Sounds' LIMIT 1), 'sight_words', 
 '{"question": "Read the word: APPLE"}', 'apple', 15, 3),

((SELECT id FROM lessons WHERE title = 'Simple Words with A' LIMIT 1), 'vocabulary', 
 '{"question": "What is this? (picture of an apple)", "image": "apple"}', 'apple', 10, 1),

((SELECT id FROM lessons WHERE title = 'Simple Words with A' LIMIT 1), 'phonics', 
 '{"question": "What is the first sound in the word ANT?"}', 'a', 10, 2),

((SELECT id FROM lessons WHERE title = 'Simple Words with A' LIMIT 1), 'sight_words', 
 '{"question": "Read the word: CAT"}', 'cat', 15, 3),

((SELECT id FROM lessons WHERE title = 'Simple Words with A' LIMIT 1), 'vocabulary', 
 '{"question": "What is this? (picture of a house)", "image": "house"}', 'house', 10, 4),

((SELECT id FROM lessons WHERE title = 'Letter O and Words' LIMIT 1), 'phonics', 
 '{"question": "What sound does the letter O make?"}', 'o', 10, 1),

((SELECT id FROM lessons WHERE title = 'Letter O and Words' LIMIT 1), 'sight_words', 
 '{"question": "Read the word: DOG"}', 'dog', 15, 2),

((SELECT id FROM lessons WHERE title = 'Letter O and Words' LIMIT 1), 'vocabulary', 
 '{"question": "What is this? (picture of a ball)", "image": "ball"}', 'ball', 10, 3);