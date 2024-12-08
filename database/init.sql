CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    title text,
    description text,
    input_identifiers text[]
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name text
);

CREATE TABLE test_cases (
    id SERIAL PRIMARY KEY,
    inputs text[],
    outputs text[]
);

CREATE TABLE question_tag (
    question_id integer REFERENCES questions (id), 
    tag_Id integer REFERENCES tags (id)
);

CREATE TABLE question_test_case (
    question_id integer REFERENCES questions (id),
    test_case_id integer REFERENCES test_cases (id)
);

INSERT INTO TABLE questions (title, description, input_identifiers) VALUES ("Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.", ["nums", "target"]);
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[2, 7, 11, 15], 18],[[1,2]])
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[3, 2, 4], 6],[[1,2]])
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[3, 3], 6],[[0,1]])
INSERT INTO TABLE tags (name) ("array")
INSERT INTO TABLE tags (name) ("hash table")
INSERT INTO TABLE question_tag (question_id, tag_id) VALUES (1, 1)
INSERT INTO TABLE question_tag (question_id, tag_id) VALUES (1, 2)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 1)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 2)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 3)

INSERT INTO TABLE questions (title, description, input_identifiers) VALUES ("Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.", ["nums", "target"]);
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[2, 7, 11, 15], 18],[[1,2]])
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[3, 2, 4], 6],[[1,2]])
INSERT INTO TABLE test_cases (inputs, outputs) VALUES ([[3, 3], 6],[[0,1]])
INSERT INTO TABLE tags (name) ("array")
INSERT INTO TABLE tags (name) ("hash table")
INSERT INTO TABLE question_tag (question_id, tag_id) VALUES (1, 1)
INSERT INTO TABLE question_tag (question_id, tag_id) VALUES (1, 2)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 1)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 2)
INSERT INTO TABLE question_test_case (question_id, test_case_id) VALUES (1, 3)