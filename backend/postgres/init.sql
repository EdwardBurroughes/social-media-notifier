CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE slack_messages (
    id uuid PRIMARY KEY,
    channel_name VARCHAR(200) NOT NULL,
    message VARCHAR,
    schedule_time TIMESTAMP,
    inserted_date VARCHAR(100),
    scheduled_status BOOL
);
