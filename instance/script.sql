CREATE TABLE Авторы (
   id_автора INTEGER PRIMARY KEY AUTOINCREMENT,
   фамилия TEXT(50) NOT NULL,
   имя TEXT(50) NOT NULL,
   отчество TEXT(50),
   дата_рождения DATE,
   страна TEXT(50)
);