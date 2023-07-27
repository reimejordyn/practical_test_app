  // GENERAL TAB
        /////////////////////////////////////////////////////////
        // Function to create a new client in the database
        function createClient(name, linkedContacts, clients) {
            const code = generateClientCode(name, clients);
            console.log("Generated Client Code:", code);

            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                action: "createClient",
                Name: name,
                num_linked_contacts: linkedContacts,
                },
                dataType: "json",
                success: function (response) {
                console.log("Server Response:", response);

                if (response.success) {
                    getClientsFromBackend(function (updatedClients) {
                    displayClients(updatedClients); 
                    cancelCreateClient();
                    });
                } else {
                    alert("Failed to create the client.");
                }
                },
                error: function (xhr, status, error) {
                console.log(xhr.responseText);
                console.log(status);
                console.log(error);
                alert("Failed to communicate with the server.");
                },
            });
        }

        function getClientsFromBackend(callback) {
            //fetch clients
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "getClients"
                },
                dataType: "json",
                success: function(clients) {
                    if (typeof callback === "function"){
                        callback(clients);
                    }
                    displayClients(clients);
                },
                error: function() {
                    alert("Failed to communicate with the server.");
                }
            });
        }

        function getClientsOnPageLoad() {
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "getClients"
                },
                dataType: "json",
                success: function(clients) {
                    displayClients(clients); 
                },
                error: function() {
                    alert("Failed to communicate with the server.");
                }
            });
        }

        // function to Genrate client code
        function generateClientCode(name, clients) {
            // Remove any extra spaces and make the name uppercase
            const formattedName = name.trim().toUpperCase();

            // If the name is less than 3 characters, add "A" to make it 3 characters long
            let alphaPart;
            if (formattedName.length >= 3) {
                alphaPart = formattedName.substring(0, 3);
            } else {
                alphaPart = formattedName + "A".repeat(3 - formattedName.length);
            }

            // Function to check if the code is unique
            function isCodeUnique(code) {
                for (const client of clients) {
                    if (client.client_code === code) {
                        return false;
                    }
                }
                return true;
            }

            //numeric part for the code
            let numericPart = 1;
            let clientCode = alphaPart + String(numericPart).padStart(3, "0");
            while (!isCodeUnique(clientCode)) {
                numericPart++;
                clientCode = alphaPart + String(numericPart).padStart(3, "0");
            }

            return clientCode;
        }

        //function to add a new client
        function addClient(event) {
            event.preventDefault();
            const name = $("#clientName").val();
            const linkedContacts = parseInt($("#linkedContacts").val());

            if (name && linkedContacts) {
                getClientsFromBackend(function(clients){
                createClient(name, linkedContacts, clients);
                })
            } else {
                alert("Please fill in all fields.");
            }
        }
        
        function createNewClient() {
        document.getElementById("createClientForm").style.display = "block";
    }

        function cancelCreateClient() {
            document.getElementById("createClientForm").style.display = "none";
        }

        //the table shown
        function displayClients(clients) {
            var tableHTML = '<table>';
            tableHTML += '<tr><th>Name</th><th>Client code</th><th>No. of linked contacts</th></tr>';
            clients.forEach(function(client) {
                tableHTML += '<tr>';
                tableHTML += '<td>' + client.Name + '</td>';
                tableHTML += '<td>' + client.client_code + '</td>';
                tableHTML += '<td>' + client.num_linked_contacts + '</td>';
                tableHTML += '</tr>';
            });
            tableHTML += '</table>';

            document.getElementById("clientTable").innerHTML = tableHTML;
        }

        //to load the table data during page load
        getClientsOnPageLoad();


        //CONTACTS TAB
        //////////////////////////////////////////////////////////////////////
        
         // to display contacts 
        function displayContacts(contacts) {
            var tableHTML = '<table>';
            if (contacts.length > 0) {
                tableHTML += '<tr><th>Name</th><th>Surname</th><th>Email address</th><th>No. of linked clients</th></tr>';
                contacts.forEach(function (contact) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>' + contact.Name + '</td>';
                    tableHTML += '<td>' + contact.Surname + '</td>';
                    tableHTML += '<td>' + contact.Email + '</td>';
                    tableHTML += '<td>' + contact.num_linked_clients + '</td>';
                    tableHTML += '</tr>';
                });
            } else {
                tableHTML += '<tr><td colspan="4">No contacts found.</td></tr>';
            }
            tableHTML += '</table>';
            document.getElementById("contactTable").innerHTML = tableHTML;
        }



        // to fetch contacts from the server
        function getContacts() {
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "getContacts" 
                },
                dataType: "json",
                success: function (contacts) {
                    
                    displayContacts(contacts); 
                },
                error: function () {
                    alert("Failed to fetch contacts from the server.");
                }
            });
        }   


        function getContactsOnTabLoad() {
            const targetTab = $(".nav-item a.active").attr("href");
            if (targetTab === "#contacts") {
                getContacts(); 
                getClientsFromBackend(function (clients) {
                    displayClientsForLinking(clients); 
                });
            }
        }


        function getContactsFromBackend(callback) {
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "getContacts"
                },
                dataType: "json",
                success: function (contacts) {
                    if (typeof callback === "function") {
                        callback(contacts);
                    }
                },
                error: function () {
                    alert("Failed to fetch contacts from the server.");
                }
            });
        }


        // Function to create a new contact in the database
        function createContact(name, surname, email) {
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "createContact",
                    Name: name,
                    Surname: surname,
                    Email: email,
                },
                dataType: "json",
                success: function (response) {
                    console.log("Server Response:", response);

                    if (response.success) {
                        getContactsFromBackend(function (updatedContacts) {
                            displayContacts(updatedContacts); 
                            cancelCreateContact();
                        });
                    } else {
                        alert("Failed to create the contact.");
                    }
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                    console.log(status);
                    console.log(error);
                    alert("Failed to communicate with the server.");
                },
            });
        }

       function createNewContact() {
                  document.getElementById("createContactForm").style.display = "block";
              }
          
       function cancelCreateContact() {
                document.getElementById("createContactForm").style.display = "none";
            }


        //this is to add the created contact
        function addContact(event) {
            event.preventDefault();
            const name = $("#contactName").val();
            const surname = $("#contactSurname").val();
            const email = $("#contactEmail").val();

            if (name && surname && email) {
                createContact(name, surname, email);
            } else {
                alert("Please fill in all fields.");
            }
        }


        getContactsFromBackend(function (contacts) {
            displayContacts(contacts);
        });

        function linkClientsToContacts(formData) {
            const url = "backend.php"; 
        
            fetch(url, {
                method: "POST",
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Clients linked to the contact successfully!");
                    getLinkedClientsWithContacts(); 
                } else {
                    alert("Failed to link clients to the contact. Please try again.");
                }
            })
            .catch(error => {
                alert("An error occurred. Please try again later.");
            });
        }
        
        function unlinkClientsFromContacts(formData) {
            const url = "backend.php"; 
        
            fetch(url, {
                method: "POST",
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Clients unlinked from the contact successfully!");
                    getLinkedClientsWithContacts(); 
                } else {
                    alert("Failed to unlink clients from the contact. Please try again.");
                }
            })
            .catch(error => {
                alert("An error occurred. Please try again later.");
            });
        }
        

        // populate the dropdown options
        function populateDropdownOptions(dropdownId, data) {
            const dropdown = document.getElementById(dropdownId);
            dropdown.innerHTML = "";

            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id; 
                option.textContent = item.Name; 
                dropdown.appendChild(option);
            });
        }
    

       
        fetch('backend.php', {
            method: 'POST',
            body: new URLSearchParams({ action: 'getClients' }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            populateDropdownOptions('clientSelect', data);
        })
        .catch(error => {
            console.error('Error fetching clients:', error);
        });

        fetch('backend.php', {
            method: 'POST',
            body: new URLSearchParams({ action: 'getContacts' }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            populateDropdownOptions('contactSelect', data);
        })
        .catch(error => {
            console.error('Error fetching contacts:', error);
        });

document.getElementById("linkForm").addEventListener("submit", function (event) {
            event.preventDefault();
            const formData = new FormData(linkForm);
        
           
            const url = "backend.php";
        
            
            const action = formData.get("action");
            if (action === "linkClientsToContacts") {
                formData.delete("action"); 
                linkClientsToContacts(formData);
            } else if (action === "unlinkClientsFromContacts") {
                formData.delete("action"); 
                unlinkClientsFromContacts(formData);
            }
        });
        
    

    
        function getLinkedClientsWithContacts() {
            $.ajax({
                type: "POST",
                url: "backend.php",
                data: {
                    action: "getLinkedClientsWithContacts"
                },
                dataType: "json",
                success: function (data) {
                    displayLinkedClientsWithContacts(data);
                },
                error: function (xhr, status, error) {
                    console.log(xhr.responseText);
                    console.log(status);
                    console.log(error);
                    alert("Failed to fetch linked clients with contacts from the server.");
                }
            });
        }

        function displayLinkedClientsWithContacts(data) {
          
            const tableBody = document.getElementById("linkedClientsTableBody");
            tableBody.innerHTML = "";
            if (!Array.isArray(data)) {
                console.error("Data is not an array:", data);
                if (data && data.message) {
                    alert("An error occurred: " + data.message);
                } else {
                    alert("Failed to fetch linked clients with contacts. Please try again.");
                }
            
                return; 
            }

            data.forEach(item => {
                const row = tableBody.insertRow();

                const clientNameCell = row.insertCell();
                clientNameCell.textContent = item.client_name;

                const clientCodeCell = row.insertCell();
                clientCodeCell.textContent = item.client_code;

                const contactNameCell = row.insertCell();
                contactNameCell.textContent = item.contact_name;

                const surnameCell = row.insertCell();
                surnameCell.textContent = item.surname;

                const emailCell = row.insertCell();
                emailCell.textContent = item.email;
            });
        }



            getLinkedClientsWithContacts();

        
