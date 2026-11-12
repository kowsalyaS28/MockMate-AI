package main

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

var db *sql.DB

func connectDatabase() {
	var err error

	connStr := "host=localhost port=5432 user=postgres password=Kowsalya2005 dbname=mockmate_db sslmode=disable"

	db, err = sql.Open("postgres", connStr)

	if err != nil {
		panic(err)
	}

	err = db.Ping()

	if err != nil {
		panic(err)
	}

	fmt.Println("Connected to PostgreSQL successfully!")
}
