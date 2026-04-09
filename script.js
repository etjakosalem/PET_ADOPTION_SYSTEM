// DYNAMIC AVATAR GENERATOR
function getAvatar(name, bgColor) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&bold=true`;
}

// STATE / DATA ARRAYS
let pets = [];
let staffs = [];
let adoptions = [];
let requests = [];

// LOCAL STORAGE PERSISTENCE
function saveData() {
    localStorage.setItem('cvpi_pets', JSON.stringify(pets));
    localStorage.setItem('cvpi_staffs', JSON.stringify(staffs));
    localStorage.setItem('cvpi_adoptions', JSON.stringify(adoptions));
    localStorage.setItem('cvpi_requests', JSON.stringify(requests));
}

function loadData() {
    const p = localStorage.getItem('cvpi_pets');
    const s = localStorage.getItem('cvpi_staffs');
    const a = localStorage.getItem('cvpi_adoptions');
    const r = localStorage.getItem('cvpi_requests');

    if(p) pets = JSON.parse(p);
    else {
        pets = [
            { id: '#ID-772', name: 'Ace', species: 'Canine', breed: 'Golden Retriever', age: 2, fee: 150, vax: 'Fully Shielded', status: 'Available', img: getAvatar('Ace', '0D47A1') },
            { id: '#ID-884', name: 'Shadow', species: 'Feline', breed: 'Bombay', age: 1, fee: 80, vax: 'Booster Pending', status: 'Deployed', img: getAvatar('Shadow', '0D47A1') },
            { id: '#ID-102', name: 'Rocket', species: 'Canine', breed: 'Beagle Mix', age: 3, fee: 100, vax: 'Fully Shielded', status: 'Available', img: getAvatar('Rocket', '0D47A1') }
        ];
    }
    
    if(s) staffs = JSON.parse(s);
    else staffs = [{ id: '#AGT-01', name: 'Sgt. Griffin', img: getAvatar('Sgt. Griffin', 'B71C1C') }];
    
    if(a) adoptions = JSON.parse(a);
    if(r) requests = JSON.parse(r);
}

// UTILS
function generateID(prefix) { return '#' + prefix + '-' + Math.floor(Math.random() * 90000 + 10000); }

function getBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function getBadgeClass(statusStr) {
    const s = statusStr.toLowerCase();
    if(s.includes('fully') || s.includes('shielded') || s === 'adopted' || s === 'deployed') return 'gold';
    if(s.includes('pending') || s.includes('urgent') || s.includes('unshielded')) return 'red';
    if(s.includes('available')) return 'green';
    return 'gray';
}

// CUSTOM DIALOG CONTROLS
let pendingAction = null;

function customConfirm(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    pendingAction = callback;
    openModal('custom-confirm-modal');
}

document.getElementById('confirm-action-btn').addEventListener('click', function() {
    if (pendingAction) pendingAction();
    closeModal('custom-confirm-modal');
    pendingAction = null;
});

function customAlert(title, message) {
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    openModal('custom-alert-modal');
}

// INITIALIZATION
window.onload = function() { loadData(); };

// NAVIGATION
function showSection(sectionId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'admin-view') renderAdminAll();
    if (sectionId === 'visitor-view') renderVisitorView();
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// LOGIN & LOGOUT
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    
    if (user === 'admin' && pass === 'admin') {
        document.getElementById('login-error').classList.add('hidden');
        showSection('admin-view');
        this.reset();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
    }
});

function logout() { showSection('landing-page'); }
function enterVisitorView() { showSection('visitor-view'); }

// MODAL CONTROLS
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
}

function openAddPetModal() {
    document.getElementById('pet-form').reset();
    document.getElementById('pet-id').value = '';
    document.getElementById('pet-modal-title').textContent = 'Input Pet Intel';
    openModal('add-pet-modal');
}

function openAddStaffModal() {
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = '';
    document.getElementById('staff-modal-title').textContent = 'Enlist Operative';
    openModal('staff-modal');
}

// RENDER ADMIN TABS
function renderAdminAll() {
    updateKPIs();
    renderDashboardTable();
    renderHistoryTable();
    renderRequestsTable();
    renderStaffTable();
}

function updateKPIs() {
    let pending = pets.filter(p => p.status === 'Available').length;
    let deployed = adoptions.length;
    let revenue = adoptions.reduce((sum, ad) => sum + Number(ad.fee || 0), 0);
    
    // Update Dashboard Numbers
    document.getElementById('kpi-deployed').textContent = deployed.toLocaleString();
    document.getElementById('kpi-pending').textContent = pending.toLocaleString();
    document.getElementById('kpi-revenue').textContent = '$' + revenue.toLocaleString();

    // UPDATE REQUEST INDICATOR
    const badge = document.getElementById('request-badge');
    if (badge) {
        if (requests.length > 0) {
            badge.textContent = requests.length;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}
// 1. DASHBOARD LOGIC
function renderDashboardTable() {
    const tbody = document.getElementById('admin-pets-tbody');
    tbody.innerHTML = '';

    const sortedPets = [...pets].sort((a, b) => {
        if (a.status === 'Available' && b.status !== 'Available') return -1;
        if (a.status !== 'Available' && b.status === 'Available') return 1;
        return 0;
    });

    sortedPets.forEach(pet => {
        tbody.innerHTML += `
            <tr>
                <td>${pet.id}</td>
                <td style="color:var(--text-gray); font-size:12px; font-weight:600;">ACTIVE LOG</td>
                <td>
                    <div class="intel-cell">
                        <img src="${pet.img}" class="intel-avatar">
                        <div class="intel-info"><strong>${pet.name}</strong></div>
                    </div>
                </td>
                <td><span style="font-size:11px; font-weight:800; color:var(--text-gray); text-transform:uppercase;">${pet.species} • ${pet.breed}</span></td>
                <td><strong>$${pet.fee}</strong></td>
                <td><span class="badge ${getBadgeClass(pet.status)}">${pet.status}</span></td>
                <td>
                    <div class="action-group">
                        <button class="btn-outline" style="padding:6px 10px;" onclick="viewPet('${pet.id}')">View</button>
                        <button class="btn-outline" style="padding:6px 10px;" onclick="editPet('${pet.id}')">Edit</button>
                        <button class="btn-primary" style="padding:6px 10px;" onclick="deletePet('${pet.id}')">Del</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

document.getElementById('pet-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('pet-id').value;
    const name = document.getElementById('pet-name').value;
    const file = document.getElementById('pet-image').files[0];
    const base64Img = await getBase64(file);
    
    const petData = {
        name: name,
        species: document.getElementById('pet-species').value,
        breed: document.getElementById('pet-breed').value,
        age: document.getElementById('pet-age').value,
        fee: document.getElementById('pet-fee').value,
        vax: document.getElementById('pet-vax').value,
        status: id ? pets.find(p=>p.id===id).status : 'Available'
    };

    if (id) {
        const pet = pets.find(p => p.id === id);
        Object.assign(pet, petData);
        if (base64Img) pet.img = base64Img;
    } else {
        petData.id = generateID('ID');
        petData.img = base64Img || getAvatar(name, '0D47A1');
        pets.push(petData);
    }
    
    saveData();
    this.reset();
    document.getElementById('pet-id').value = '';
    closeModal('add-pet-modal');
    renderAdminAll();
});

function editPet(id) {
    const pet = pets.find(p => p.id === id);
    document.getElementById('pet-modal-title').textContent = 'Update Pet Intel';
    document.getElementById('pet-id').value = pet.id;
    document.getElementById('pet-name').value = pet.name;
    document.getElementById('pet-species').value = pet.species;
    document.getElementById('pet-breed').value = pet.breed;
    document.getElementById('pet-age').value = pet.age;
    document.getElementById('pet-fee').value = pet.fee;
    document.getElementById('pet-vax').value = pet.vax;
    openModal('add-pet-modal');
}

function deletePet(id) {
    customConfirm('PURGE INTEL', 'Authorized purge of intel file?', () => {
        pets = pets.filter(p => p.id !== id);
        saveData();
        renderAdminAll();
    });
}

function viewPet(id) {
    const pet = pets.find(p => p.id === id);
    const content = `
        <img src="${pet.img}">
        <p><strong>Designation:</strong> ${pet.id}</p>
        <p><strong>Codename:</strong> ${pet.name}</p>
        <p><strong>Profile:</strong> ${pet.species} • ${pet.breed}</p>
        <p><strong>Age:</strong> ${pet.age} cycles</p>
        <p><strong>Shield Status:</strong> <span class="badge ${getBadgeClass(pet.vax)}">${pet.vax}</span></p>
        <p><strong>Current Status:</strong> <span class="badge ${getBadgeClass(pet.status)}">${pet.status}</span></p>
    `;
    document.getElementById('pet-details-content').innerHTML = content;
    openModal('view-pet-modal');
}

// ADOPT PET (ADMIN DIRECT)
function openAdminAdoptModal() {
    const petSelect = document.getElementById('adopt-pet-select');
    const staffSelect = document.getElementById('adopt-staff-select');
    
    petSelect.innerHTML = '<option value="" disabled selected>Select Target Pet</option>';
    pets.filter(p => p.status === 'Available').forEach(p => {
        petSelect.innerHTML += `<option value="${p.id}">${p.name} (${p.id})</option>`;
    });

    staffSelect.innerHTML = '<option value="" disabled selected>Assign Supervising Agent</option>';
    staffs.forEach(s => {
        staffSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });

    openModal('admin-adopt-modal');
}

document.getElementById('admin-adopt-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const petId = document.getElementById('adopt-pet-select').value;
    const staffId = document.getElementById('adopt-staff-select').value;
    const file = document.getElementById('adopter-image').files[0];
    const base64Img = await getBase64(file);
    const adopterName = document.getElementById('adopter-name').value;

    createAdoption(petId, staffId, {
        name: adopterName,
        contact: document.getElementById('adopter-contact').value,
        address: document.getElementById('adopter-address').value,
        img: base64Img || getAvatar(adopterName, '64748B')
    });

    this.reset();
    closeModal('admin-adopt-modal');
});

function createAdoption(petId, staffId, adopterInfo) {
    const pet = pets.find(p => p.id === petId);
    const staff = staffs.find(s => s.id === staffId);
    pet.status = 'Deployed';

    const adoption = {
        adoptionId: generateID('AD'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
        petId: pet.id,
        petName: pet.name,
        petBreed: pet.breed,
        petSpecies: pet.species,
        petImg: pet.img,
        adopterName: adopterInfo.name,
        contactNumber: adopterInfo.contact,
        address: adopterInfo.address,
        adopterImg: adopterInfo.img,
        staffId: staff.id,
        staffName: staff.name,
        staffImg: staff.img,
        fee: pet.fee,
        vax: pet.vax
    };

    adoptions.push(adoption);
    saveData();
    renderAdminAll();
}

// 2. MISSION RECORDS (HISTORY)
function renderHistoryTable() {
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';
    
    adoptions.forEach(ad => {
        tbody.innerHTML += `
            <tr>
                <td>${ad.adoptionId}</td>
                <td style="color:var(--text-gray); font-size:12px; font-weight:600;">${ad.date}</td>
                <td>
                    <div class="intel-cell">
                        <img src="${ad.petImg}" class="intel-avatar">
                        <div class="intel-info">
                            <strong>${ad.petName} <span style="font-weight:400; font-size:12px;">(${ad.petId})</span></strong>
                            <span>${ad.petSpecies} • ${ad.petBreed}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="intel-cell">
                        <img src="${ad.adopterImg}" style="width:35px; height:35px; border-radius:50%; object-fit:cover;">
                        <div class="intel-info">
                            <strong>${ad.adopterName}</strong>
                            <span>${ad.contactNumber}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="intel-cell">
                        <img src="${ad.staffImg}" style="width:30px; height:30px; border-radius:50%;">
                        <span style="font-size:13px; font-weight:600;">${ad.staffName}</span>
                    </div>
                </td>
                <td><span class="badge ${getBadgeClass(ad.vax)}">${ad.vax}</span></td>
                <td>
                    <button class="btn-outline" style="padding:6px 10px;" onclick="viewAdopter('${ad.adoptionId}')">View Adopter</button>
                </td>
            </tr>
        `;
    });
}

function viewAdopter(adoptionId) {
    const ad = adoptions.find(a => a.adoptionId === adoptionId);
    const content = `
        <img src="${ad.adopterImg}" alt="Adopter Photo" style="width:100%; height:200px; object-fit:cover; border-radius:12px; margin-bottom:20px;">
        <p><strong>Name:</strong> ${ad.adopterName}</p>
        <p><strong>Contact:</strong> ${ad.contactNumber}</p>
        <p><strong>Location/Base:</strong> ${ad.address || 'Classified'}</p>
    `;
    document.getElementById('adopter-details-content').innerHTML = content;
    openModal('view-adopter-modal');
}

// 3. CIVILIAN REQUESTS
function renderRequestsTable() {
    const tbody = document.getElementById('requests-tbody');
    tbody.innerHTML = '';
    
    requests.forEach(req => {
        tbody.innerHTML += `
            <tr>
                <td>${req.requestId}</td>
                <td style="color:var(--text-gray); font-size:12px; font-weight:600;">${req.date}</td>
                <td><strong>${req.petName}</strong> <br><span style="font-size:10px; color:var(--text-gray);">${req.petId}</span></td>
                <td>
                    <div class="intel-cell">
                        <img src="${req.adopterImg}" class="intel-avatar">
                        <div class="intel-info">
                            <strong>${req.adopterName}</strong>
                            <span>${req.contact}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="action-group">
                        <button class="btn-primary" style="padding:6px 10px;" onclick="openConfirmRequest('${req.requestId}')">Approve</button>
                        <button class="btn-outline" style="padding:6px 10px; border-color:var(--danger); color:var(--danger);" onclick="declineRequest('${req.requestId}')">Reject</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openConfirmRequest(reqId) {
    const req = requests.find(r => r.requestId === reqId);
    const pet = pets.find(p => p.id === req.petId);

    // VALIDATION: Check if pet exists and is still available
    if (!pet) {
        customAlert('INTEL MISSING', 'This pet no longer exists in the database.');
        return;
    }
    if (pet.status !== 'Available') {
        customAlert('DEPLOYMENT DENIED', 'Pet already deployed.');
        return;
    }

    document.getElementById('confirm-req-id').value = reqId;
    const staffSelect = document.getElementById('confirm-staff-select');
    staffSelect.innerHTML = '<option value="" disabled selected>Assign Supervising Agent</option>';
    staffs.forEach(s => {
        staffSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
    openModal('confirm-request-modal');
}

document.getElementById('confirm-request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const reqId = document.getElementById('confirm-req-id').value;
    const staffId = document.getElementById('confirm-staff-select').value;
    
    const reqIndex = requests.findIndex(r => r.requestId === reqId);
    const req = requests[reqIndex];
    const pet = pets.find(p => p.id === req.petId);

    // SECONDARY CHECK: Just in case status changed while modal was open
    if (!pet || pet.status !== 'Available') {
        closeModal('confirm-request-modal');
        customAlert('DEPLOYMENT DENIED', 'Pet already deployed.');
        return;
    }

    createAdoption(req.petId, staffId, {
        name: req.adopterName,
        contact: req.contact,
        address: req.address,
        img: req.adopterImg
    });

    requests.splice(reqIndex, 1);
    saveData();
    this.reset();
    closeModal('confirm-request-modal');
    renderAdminAll();
    
    // Optional: Notify success
    customAlert('MISSION APPROVED', 'Deployment authorized successfully.');
});

function declineRequest(reqId) {
    customConfirm('REJECT APPLICATION', 'Reject civilian application?', () => {
        requests = requests.filter(r => r.requestId !== reqId);
        saveData();
        renderAdminAll();
    });
}

// 4. HQ ROSTER (STAFF)
function renderStaffTable() {
    const tbody = document.getElementById('staffs-tbody');
    tbody.innerHTML = '';
    
    staffs.forEach(staff => {
        tbody.innerHTML += `
            <tr>
                <td>${staff.id}</td>
                <td><img src="${staff.img}" class="intel-avatar"></td>
                <td><strong>${staff.name}</strong></td>
                <td>
                    <div class="action-group">
                        <button class="btn-outline" style="padding:6px 10px;" onclick="editStaff('${staff.id}')">Edit</button>
                        <button class="btn-outline" style="padding:6px 10px; border-color:var(--danger); color:var(--danger);" onclick="deleteStaff('${staff.id}')">Discharge</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

document.getElementById('staff-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('staff-id').value;
    const name = document.getElementById('staff-name').value;
    const file = document.getElementById('staff-image').files[0];
    const base64Img = await getBase64(file);

    if (id) {
        const staff = staffs.find(s => s.id === id);
        staff.name = name;
        if (base64Img) staff.img = base64Img;
    } else {
        staffs.push({
            id: generateID('AGT'),
            name: name,
            img: base64Img || getAvatar(name, 'B71C1C')
        });
    }

    saveData();
    this.reset();
    document.getElementById('staff-id').value = '';
    closeModal('staff-modal');
    renderAdminAll();
});

function editStaff(id) {
    const staff = staffs.find(s => s.id === id);
    document.getElementById('staff-modal-title').textContent = 'Update Operative';
    document.getElementById('staff-id').value = staff.id;
    document.getElementById('staff-name').value = staff.name;
    openModal('staff-modal');
}

function deleteStaff(id) {
    customConfirm('DISCHARGE OPERATIVE', 'Discharge operative from duty?', () => {
        staffs = staffs.filter(s => s.id !== id);
        saveData();
        renderAdminAll();
    });
}

// 5. CIVILIAN PORTAL (VISITOR VIEW)
function renderVisitorView() {
    const grid = document.getElementById('visitor-pet-grid');
    grid.innerHTML = '';
    
    const availablePets = pets.filter(p => p.status === 'Available');
    if (availablePets.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-gray);">No heroes currently awaiting deployment.</p>';
        return;
    }

    availablePets.forEach(pet => {
        grid.innerHTML += `
            <div class="pet-card">
                <img src="${pet.img}">
                <h4>${pet.name}</h4>
                <p>${pet.species} • ${pet.breed} | ${pet.age} CYCLES</p>
                <div class="btn-group">
                    <button class="btn-outline" onclick="viewPet('${pet.id}')">View Intel</button>
                    <button class="btn-primary" onclick="openVisitorAdopt('${pet.id}')">Request Deployment</button>
                </div>
            </div>
        `;
    });
}

function openVisitorAdopt(petId) {
    document.getElementById('visitor-req-pet-id').value = petId;
    openModal('visitor-adopt-modal');
}

document.getElementById('visitor-adopt-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const petId = document.getElementById('visitor-req-pet-id').value;
    const pet = pets.find(p => p.id === petId);
    
    const file = document.getElementById('req-adopter-image').files[0];
    const base64Img = await getBase64(file);
    const applicantName = document.getElementById('req-adopter-name').value;

    requests.push({
        requestId: generateID('REQ'),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
        petId: pet.id,
        petName: pet.name,
        adopterName: applicantName,
        contact: document.getElementById('req-adopter-contact').value,
        address: document.getElementById('req-adopter-address').value,
        adopterImg: base64Img || getAvatar(applicantName, '64748B')
    });

    saveData();
    this.reset();
    closeModal('visitor-adopt-modal');
    customAlert('REQUEST LOGGED', 'Deployment request logged! HQ will review shortly.');
});