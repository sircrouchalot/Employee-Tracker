class Employee {
    constructor(firstName, lastName, role, salary, manager) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.salary = salary;
        this.manager = manager;
        this.role = this.role;
    }

    getName() {
        return this.firstName + this.lastName;
    }

    getRole() {
        return this.role;
    }
    
    getSalary() {
        return this.salary;
    }

    getManager() {
        return this.manager;
    }
}

module.exports = Employee;