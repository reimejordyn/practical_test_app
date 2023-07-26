<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/practical_test_app/error.log');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Connect to the database
$servername = "localhost";
$username = "root";
$password = "DRAGQUEEN"; 
$dbname = "practical_test";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// get all clients from the database
function getClients() {
    global $conn;
    $sql = "SELECT * FROM clients ORDER BY Name ASC";
    $result = $conn->query($sql);
    $clients = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $clients[] = $row;
        }
    }

    return $clients;
}

// Function to generate a unique client code
function generateClientCode($name) {
    global $conn;

    
    $formattedName = trim(strtoupper($name));


    $alphaPart = (strlen($formattedName) >= 3) ? substr($formattedName, 0, 3) : $formattedName . str_repeat("A", 3 - strlen($formattedName));

    
    $numericPart = 1;
    $clientCode = $alphaPart . str_pad($numericPart, 3, "0", STR_PAD_LEFT);
    $isCodeUnique = false;

    while (!$isCodeUnique) {
    
        $sql = "SELECT * FROM clients WHERE client_code = '$clientCode'";
        $result = $conn->query($sql);

        if ($result->num_rows === 0) {
            $isCodeUnique = true;
        } else {
            
            $numericPart++;
            $clientCode = $alphaPart . str_pad($numericPart, 3, "0", STR_PAD_LEFT);
        }
    }

    return $clientCode;
}

// Function to create a new client in the database
function createClient($name, $linkedContacts) {
    global $conn;
     // Generate the client code
     $code = generateClientCode($name);

    $sql = "INSERT INTO clients (Name, client_code, num_linked_contacts) VALUES ('$name', '$code', $linkedContacts)";
    if ($conn->query($sql) === TRUE) {
        return true;
    } else {
        return false;
    }
}


// Function to create a new contact in the database
function createContact($name, $surname, $email) {
    global $conn;

    // Check if the email is unique
    $email = $conn->real_escape_string($email);
    $sql = "SELECT * FROM contacts WHERE Email = '$email'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        return false;
    }

    $sql = "INSERT INTO contacts (Name, Surname, Email) VALUES ('$name', '$surname', '$email')";
    if ($conn->query($sql) === TRUE) {
        return true;
    } else {
        return false;
    }
}


// Function to fetch all contacts from the database
function getContacts() {
    global $conn;
    $sql = "SELECT * FROM contacts ORDER BY Name ASC";
    $result = $conn->query($sql);
    $contacts = array();
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $contacts[] = $row;
        }
    }

    return $contacts;
}

function linkClientsToContacts($client_id, $contact_id) {
    global $conn;
    $sql = "INSERT INTO linked_contacts (client_id, contact_id) VALUES ($client_id, $contact_id)";
    if ($conn->query($sql)) {
        return array("success" => true);
    } else {
        return array("success" => false, "error" => "Failed to link clients to contacts: " . $conn->error);
    }
    echo json_encode($response); 
}
function unlinkClientsFromContacts($client_id, $contact_id) {
    global $conn;
    $sql = "DELETE FROM linked_contacts WHERE client_id = $client_id AND contact_id = $contact_id";
    if ($conn->query($sql)) {
        return array("success" => true);
    } else {
        return array("success" => false, "error" => "Failed to unlink clients from contacts: " . $conn->error);
    }
    echo json_encode($response); 
}

function getLinkedClientsWithContacts() {
    global $conn;
    $sql = "SELECT c.Name AS client_name, c.client_code, co.Name AS contact_name, co.surname, co.email
            FROM clients c
            JOIN linked_contacts lc ON c.id = lc.client_id
            JOIN contacts co ON lc.contact_id = co.id";
    
    $result = $conn->query($sql);
    $data = array();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
    }

    echo json_encode($data);
}



// AJAX requests
if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'getClients':
            $clients = getClients();
            echo json_encode($clients);
            break;
        case 'createClient':
            $name = $_POST['Name'];
            $linkedContacts = $_POST['num_linked_contacts'];
            $result = createClient($name,$linkedContacts);
            echo json_encode(array('success' => $result));
            break;
            case 'createContact':
                $name = $_POST['Name'];
                $surname = $_POST['Surname'];
                $email = $_POST['Email'];
                $result = createContact($name, $surname, $email);
                echo json_encode(array('success' => $result));
                break;
            case 'getContacts':
                    $contacts = getContacts();
                    echo json_encode($contacts);
                    break;
            case 'linkClientsToContacts':
                    $client_id = $_POST["client_id"];
                    $contact_id = $_POST["contact_id"];
                    linkClientsToContacts($client_id, $contact_id);
                    echo json_encode(array("success" => true));
                     break;
            case 'unlinkClientsFromContacts':
                    $client_id = $_POST["client_id"];
                    $contact_id = $_POST["contact_id"];
                    unlinkClientsFromContacts($client_id, $contact_id);
                    echo json_encode(array("success" => true));
                        break;
                    default:
                        echo json_encode(array("success" => false, "message" => "Invalid action."));
                    break;
                

        
    }
}




$conn->close();
?>