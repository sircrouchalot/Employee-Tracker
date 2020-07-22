const mysql = require("mysql");
const inquirer = require("inquirer");
const Employee = require("./classes/Employee.js");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
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

var employees = [];

var newEmployeePrompts = [
  {
    type: "input",
    message: "What is their first name?",
    name: "firstName",
  },
  {
    type: "input",
    message: "What is their last name?",
    name: "lastName",
  },
  {
    type: "list",
    message: "What is their role?",
    choices: roles,
    name: "title",
  },
  {
    type: "input",
    message: "Enter their manager's id:",
    name: "manager",
  },
];

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
        addEmployee();
        break;
      case "Remove Employee":
        removeEmployee();
        break;
      case "Update Employee Role":
        updateRole();
        break;
      default:
        process.exit();
    }
  });
}

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
      WHERE departments.name = ?`,
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
      WHERE role.title = ?`,
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
  inquirer.prompt(newEmployeePrompts).then(function (response) {
    let newEmployee = new Employee(
      response.firstName,
      response.lastName,
      response.title,
      response.manager
    );
    let role_id = roles.findIndex((element) => element === response.title) + 1;
    if (newEmployee.manager === "") {
      newEmployee.manager = null;
    }
    connection.query(
      `INSERT INTO employees(first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?);`,
      [
        newEmployee.firstName,
        newEmployee.lastName,
        role_id,
        newEmployee.manager,
      ],
      (err, res) => {
        if (err) throw err;
        console.log("Adding employee...SUCCESSFUL!");
        start();
      }
    );
  });
}

function removeEmployee() {
  let employeeNames = [];
  connection.query(
    `SELECT CONCAT(first_name, " ", last_name) AS full_name
      FROM employees;`,
    function (err, res) {
      if (err) throw err;
      res.forEach((a) => employeeNames.push(a.full_name));

      inquirer
        .prompt({
          type: "list",
          message: "Which employee?",
          choices: employeeNames,
          name: "employee",
        })
        .then(function (response) {
          console.log(response.employee);
          let newArr = response.employee.split(" ");
          connection.query(
            `DELETE FROM employees WHERE first_name = ? AND last_name = ?`,
            [newArr[0], newArr[1]],
            (err, res) => {
              if (err) throw err;
              console.log("Removal of employee...SUCCESSFUL!");
              start();
            }
          );
        });
    }
  );
}

function updateRole() {
  let employeeNames = [];
  connection.query(
    `SELECT CONCAT(first_name, " ", last_name) AS full_name
      FROM employees;`,
    function (err, res) {
      if (err) throw err;
      res.forEach((a) => employeeNames.push(a.full_name));

      inquirer
        .prompt(
          [
          {
            type: "list",
            message: "Which employee?",
            choices: employeeNames,
            name: "employee",
          },
          {
            type: "list",
            message: "What is their new role?",
            choices: roles,
            name: "newRole",
          }
          ]
        )
        .then(function (response) {
          console.log(response.employee);
          let newArr = response.employee.split(" ");
          let role_id =
            roles.findIndex((element) => element === response.newRole) + 1;
          connection.query(
            `UPDATE employees
              SET 
                role_id = ?
              WHERE first_name = ?;`,
            [role_id, newArr[0]],
            (err, res) => {
              if (err) throw err;
              console.log("Updating employee role...SUCCESSFUL!");
              start();
            }
          );
        });
    }
  );
}
