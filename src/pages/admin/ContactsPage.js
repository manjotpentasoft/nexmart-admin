import React, { useEffect, useState } from "react";
import "../../styles/AdminContactsPage.css";
import AdminLayout from "../../components/AdminLayout";
import { fetchContacts } from "../../firebase/contactService";

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getContacts = async () => {
      try {
        const data = await fetchContacts();
        setContacts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getContacts();
  }, []);

  return (
    <AdminLayout>
      <div className="admin-contacts-title">
        <h1>Contact Messages</h1>
        <p>Manage contacts here.</p>
      </div>
      <div className="admin-contacts-wrapper contacts-table-section">
        {loading ? (
          <div className="loader"></div>
        ) : contacts.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || "-"}</td>
                  <td>{contact.subject || "-"}</td>
                  <td>{contact.message}</td>
                  <td>
                    {contact.createdAt
                      ? new Date(contact.createdAt.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactsPage;
