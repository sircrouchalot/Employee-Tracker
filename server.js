const mysql = require("mysql");
const inquirer = require("inquirer");
const { connect } = require("http2");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "EmfQApefgsKeL4YaPe",
  database: "employee_db",
});

var departments = ["Sales", "Engineering", "Legal", "Finance"];

var prompts = [
  {
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Employees by Department",
      "View All Employees by Role",
      "View All Employees by Manager",
      "Add Employee",
      "Remove Employee",
      "Update Employee Role",
    ],
    name: "action",
  },
  {
    type: "rawlist",
    message: "Which department?",
    choices: departments,
    name: "department",
    when: (response) => response.action === "View All Employees by Department",
  },
];

connection.connect(function (err) {
  if (err) throw err;
  runInquirer();
});

function runInquirer() {
  inquirer.prompt(prompts).then(function (response) {
    switch (response.action) {
      case "View All Employees":
        returnEmployeeTable();
        runInquirer();
        return;
      case "View All Employees by Department":
        employeesByDept(response.department);
        runInquirer();
        return;
      default:
        break;
    }
  });
}

function returnEmployeeTable() {
  connection.query(`SELECT * FROM employees`, function (err, res) {
    if (err) throw err;
    console.log("\n");
    console.table(res);
  });
}

function employeesByDept(dept) {
  connection.query(
    `SELECT * FROM employees WHERE Department = ?`,
    [dept],
    (err, results) => {
      if (err) throw err;
      console.log("Finding employees by department: " + dept);
      console.table(results);
    }
  );
}
