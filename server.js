const mysql = require("mysql");
const inquirer = require("inquirer");
const Employee = require("./classes/Employee.js");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "EmfQApefgsKeL4YaPe",
  database: "employee_db",
});

var departments = ["Sales", "Engineering", "Legal", "Finance"];

var roles = [
  "Engineer",
  "Lead Engineer",
  "Salesperson",
  "Sales Lead",
  "Paralegal",
  "Lawyer",
  "Accountant",
];

var managers = [];

var newEmployeePrompts = [
  {
    type: "input",
    message: "What is their first name?",
    name: "firstName"
  },
  {
    type: "input",
    message: "What is their last name?",
    name: "lastName"
  },
  {
    type: "list",
    message: "What is their role?",
    choices: roles,
    name: "title"
  },
  {
    type: "input",
    message: "Enter their manager's id:",
    name: "manager"
  }
]

var prompts = [
  {
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Employees by Department",
      "View All Employees by Role",
      "Add Employee",
      "Remove Employee",
      "Update Employee Role",
      "EXIT",
    ],
    name: "action",
  },
  {
    type: "list",
    message: "Which department?",
    choices: departments,
    name: "department",
    when: (response) => response.action === "View All Employees by Department",
  },
  {
    type: "list",
    message: "Which role?",
    choices: roles,
    name: "role",
    when: (response) => response.action === "View All Employees by Role",
  },
  {
    type: "list",
    message: "Which manager?",
    choices: roles,
    name: "manager",
    when: (response) => response.action === "View All Employees by Manager",
  },
];

connection.connect(function (err) {
  if (err) throw err;
  start();
});

function start() {
  inquirer.prompt(prompts).then(function (response) {
    switch (response.action) {
      case "View All Employees":
        returnAll();
        break;
      case "View All Employees by Department":
        viewDepts(response.department);
        break;
      case "View All Employees by Role":
        viewRoles(response.role);
        break;
      case "Add Employee":
        addEmployee(response);
        break;
      case "Remove Employee":
        break;
      case "Update Employee Role":
        break;
      default:
        process.exit();
    }
  });

  function returnAll() {
    connection.query(
      `SELECT employees.id, employees.first_name AS First, employees.last_name AS Last, departments.name AS Department, role.title AS Title, role.salary AS Salary, employees.manager_id
      FROM employees
      LEFT JOIN role ON role.id = employees.role_id
      LEFT JOIN departments ON role.department_id = departments.id;`,
      function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);
        start();
      }
    );
  }

  function viewDepts(dept) {
    connection.query(
      `SELECT employees.id, employees.first_name AS First, employees.last_name AS Last, departments.name AS Department, role.title AS Title, role.salary AS Salary, employees.manager_id
      FROM employees
      LEFT JOIN role ON role.id = employees.role_id
      LEFT JOIN departments ON role.department_id = departments.id
      WHERE Department = ?`,
      [dept],
      (err, results) => {
        if (err) throw err;
        console.log("Finding employees by department: " + dept);
        console.table(results);
        start();
      }
    );
  }

  function viewRoles(role) {
    connection.query(
      `SELECT employees.id, employees.first_name AS First, employees.last_name AS Last, departments.name AS Department, role.title AS Title, role.salary AS Salary, employees.manager_id
      FROM employees
      LEFT JOIN role ON role.id = employees.role_id
      LEFT JOIN departments ON role.department_id = departments.id
      WHERE Title = ?`,
      [role],
      (err, res) => {
        if (err) throw err;
        console.log("Finding employees by role: " + role);
        console.table(res);
        start();
      }
    );
  }

  function addEmployee() {
    inquirer
    .prompt(newEmployeePrompts)
    .then(function(response) {
      let newEmployee = new Employee(response.firstName, response.lastName, response.title, response.manager);
      let role_id = roles.findIndex((element) => element === response.title) + 1;
      if (response.manager === '') {
        response.manager = null;
      }
      connection.query(
        `INSERT INTO employees(first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?);`,
        [response.firstName, response.lastName, role_id, response.manager],
        (err, res) => {
          if (err) throw err;
          console.table("Adding employee...SUCCESSFUL!")
          start();
        }
      );
    });
  }
}
