// Initialize data storage
let users = JSON.parse(localStorage.getItem('users')) || {
    students: [],
    teachers: [],
    admin: [{ username: 'admin', password: 'admin123', fullName: 'System Administrator' }]
};

let grades = JSON.parse(localStorage.getItem('grades')) || [];
let notifications = JSON.parse(localStorage.getItem('notifications')) || [];

let currentUser = null;

// Login form functions
function showLoginForm(userType) {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('loginTitle').textContent = `${userType.charAt(0).toUpperCase() + userType.slice(1)} Login`;
    currentUser = { type: userType };
}

function hideLoginForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('loginFormElement').reset();
}

function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
}

function hideRegisterForm() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('registerFormElement').reset();
}

// Form submission handlers
document.getElementById('loginFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (currentUser.type === 'admin') {
        const admin = users.admin.find(a => a.username === username && a.password === password);
        if (admin) {
            showDashboard('admin');
        } else {
            alert('Invalid admin credentials');
        }
    } else {
        const userList = currentUser.type === 'student' ? users.students : users.teachers;
        const user = userList.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = { ...user, type: currentUser.type };
            showDashboard(currentUser.type);
        } else {
            alert('Invalid credentials');
        }
    }
});

document.getElementById('registerFormElement').addEventListener('submit', function(e) {
    e.preventDefault();
    const userType = document.getElementById('userType').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('fullName').value;

    const userList = userType === 'student' ? users.students : users.teachers;
    
    if (userList.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    userList.push({ username, password, fullName });
    localStorage.setItem('users', JSON.stringify(users));
    hideRegisterForm();
    alert('Registration successful! Please login.');
    showLoginForm(userType);
});

// Dashboard functions
function showDashboard(userType) {
    const container = document.querySelector('.container');
    container.innerHTML = '';

    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';

    const header = document.createElement('div');
    header.className = 'dashboard-header';
    
    if (userType === 'student') {
        header.innerHTML = `
            <h1>Student Dashboard</h1>
            <div class="header-buttons">
                <button class="notification-btn" onclick="showNotifications()" title="Check Notifications">
                    <i class="fas fa-bell"></i>
                </button>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        header.innerHTML = `
            <h1>${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard</h1>
            <button class="logout-btn" onclick="logout()">Logout</button>
        `;
    }
    
    dashboard.appendChild(header);

    switch (userType) {
        case 'student':
            showStudentDashboard(dashboard);
            break;
        case 'teacher':
            showTeacherDashboard(dashboard);
            break;
        case 'admin':
            showAdminDashboard(dashboard);
            break;
    }

    container.appendChild(dashboard);
}

function showStudentDashboard(dashboard) {
    const studentGrades = grades.filter(g => g.studentId === currentUser.username);
    
    const gradesTable = document.createElement('table');
    gradesTable.className = 'grade-table';
    gradesTable.innerHTML = `
        <tr>
            <th>Subject</th>
            <th>Grade</th>
            <th>Status</th>
            <th>Date</th>
        </tr>
    `;

    studentGrades.forEach(grade => {
        const row = document.createElement('tr');
        const status = grade.grade >= 30 ? 'Pass' : 'Fail';
        const statusClass = grade.grade >= 30 ? 'status-pass' : 'status-fail';
        
        row.innerHTML = `
            <td>${grade.subject}</td>
            <td>${grade.grade}</td>
            <td><span class="${statusClass}">${status}</span></td>
            <td>${grade.date}</td>
        `;
        gradesTable.appendChild(row);
    });

    // Add overall status summary
    const summary = document.createElement('div');
    summary.className = 'status-summary';
    
    const totalGrades = studentGrades.length;
    const failedGrades = studentGrades.filter(g => g.grade < 30).length;
    const overallStatus = failedGrades === 0 ? 'Pass' : 'Fail';
    const overallStatusClass = failedGrades === 0 ? 'status-pass' : 'status-fail';
    
    summary.innerHTML = `
        <h2>Overall Status</h2>
        <div class="summary-content">
            <p>Total Subjects: ${totalGrades}</p>
            <p>Failed Subjects: ${failedGrades}</p>
            <p>Overall Status: <span class="${overallStatusClass}">${overallStatus}</span></p>
        </div>
    `;

    dashboard.appendChild(summary);
    dashboard.appendChild(gradesTable);
}

function showTeacherDashboard(dashboard) {
    const stats = document.createElement('div');
    stats.innerHTML = `
        <h2>Statistics</h2>
        <p>Total Students: ${users.students.length}</p>
    `;

    const addGradeForm = document.createElement('form');
    addGradeForm.innerHTML = `
        <h2>Add Grade</h2>
        <select id="studentSelect" required>
            <option value="">Select Student</option>
            ${users.students.map(s => `<option value="${s.username}">${s.fullName}</option>`).join('')}
        </select>
        <input type="text" id="subject" placeholder="Subject" required>
        <input type="number" id="grade" placeholder="Grade" min="0" max="100" required>
        <button type="submit">Add Grade</button>
    `;

    addGradeForm.onsubmit = function(e) {
        e.preventDefault();
        const studentId = document.getElementById('studentSelect').value;
        const subject = document.getElementById('subject').value;
        const grade = document.getElementById('grade').value;

        grades.push({
            id: Date.now(), // Add unique ID for each grade
            studentId,
            subject,
            grade,
            date: new Date().toLocaleDateString(),
            teacherId: currentUser.username
        });

        localStorage.setItem('grades', JSON.stringify(grades));
        alert('Grade added successfully!');
        showDashboard('teacher');
    };

    // Create grades table
    const gradesTable = document.createElement('table');
    gradesTable.className = 'grade-table';
    gradesTable.innerHTML = `
        <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Grade</th>
            <th>Date</th>
            <th>Actions</th>
        </tr>
    `;

    // Filter grades for this teacher
    const teacherGrades = grades.filter(g => g.teacherId === currentUser.username);

    teacherGrades.forEach(grade => {
        const student = users.students.find(s => s.username === grade.studentId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.fullName : 'Unknown Student'}</td>
            <td>${grade.subject}</td>
            <td>${grade.grade}</td>
            <td>${grade.date}</td>
            <td>
                <button class="edit-btn" onclick="editGrade(${grade.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteGrade(${grade.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        gradesTable.appendChild(row);
    });

    dashboard.appendChild(stats);
    dashboard.appendChild(addGradeForm);
    dashboard.appendChild(gradesTable);
}

function editGrade(gradeId) {
    const grade = grades.find(g => g.id === gradeId);
    if (!grade) return;

    const newGrade = prompt(`Enter new grade for ${grade.subject}:`, grade.grade);
    if (newGrade === null) return; // User cancelled

    const gradeNum = parseFloat(newGrade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
        alert('Please enter a valid grade between 0 and 100');
        return;
    }

    grade.grade = gradeNum;
    grade.date = new Date().toLocaleDateString();
    localStorage.setItem('grades', JSON.stringify(grades));
    showDashboard('teacher');
}

function deleteGrade(gradeId) {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    const index = grades.findIndex(g => g.id === gradeId);
    if (index !== -1) {
        grades.splice(index, 1);
        localStorage.setItem('grades', JSON.stringify(grades));
        showDashboard('teacher');
    }
}

function showAdminDashboard(dashboard) {
    const manageUsers = document.createElement('div');
    manageUsers.innerHTML = `
        <h2>Manage Users</h2>
        <div class="user-lists">
            <div>
                <h3>Teachers</h3>
                <ul>
                    ${users.teachers.map(t => `
                        <li>${t.fullName} (${t.username})
                            <button class="delete-btn" onclick="deleteUser('teacher', '${t.username}')">Delete</button>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div>
                <h3>Students</h3>
                <ul>
                    ${users.students.map(s => `
                        <li>${s.fullName} (${s.username})
                            <button class="delete-btn" onclick="deleteUser('student', '${s.username}')">Delete</button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    dashboard.appendChild(manageUsers);
}

function showNotifications() {
    const userNotifications = notifications.filter(n => n.userId === currentUser.username);
    if (userNotifications.length === 0) {
        alert('No new notifications');
        return;
    }

    const notificationList = userNotifications.map(n => `
        ${n.message} (${n.date})
    `).join('\n');

    alert(notificationList);
}

function deleteUser(userType, username) {
    if (confirm('Are you sure you want to delete this user?')) {
        const userList = userType === 'student' ? users.students : users.teachers;
        const index = userList.findIndex(u => u.username === username);
        if (index !== -1) {
            userList.splice(index, 1);
            localStorage.setItem('users', JSON.stringify(users));
            showDashboard('admin');
        }
    }
}

function logout() {
    currentUser = null;
    location.reload();
} 