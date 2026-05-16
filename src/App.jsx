import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

const API = 'http://localhost:5000/api'

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})

function App() {
  const [page, setPage] = useState("login")
  const [role, setRole] = useState("student")
  const [showPassword, setShowPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const [requests, setRequests] = useState([
    {
      id: 1,
      student: "Raffy",
      document: "Transcript of Records",
      purpose: "Employment requirement",
      contact: "09123456789",
      status: "Pending",
      dateRequested: "May 12, 2026",
      isDeleted: false
    },
    {
      id: 2,
      student: "Raffy",
      document: "Good Moral Certificate",
      purpose: "Scholarship application",
      contact: "09123456789",
      status: "Released",
      dateRequested: "May 12, 2026",
      isDeleted: false
    }
  ])

  const [documentType, setDocumentType] = useState("Transcript of Records")
  const [purpose, setPurpose] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const [documentTypes, setDocumentTypes] = useState([
    "Transcript of Records",
    "Good Moral Certificate",
    "Certificate of Enrollment",
    "Clearance",
    "Diploma Request"
  ])

  const [newDocumentType, setNewDocumentType] = useState("")
  const [documentTypeMap, setDocumentTypeMap] = useState({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (page === "studentDashboard" || page === "adminDashboard") {
      // eslint-disable-next-line react-hooks/immutability
      loadRequests()
      // eslint-disable-next-line react-hooks/immutability
      loadDocumentTypes()
    }
  }, [page])

  const loadRequests = async () => {
    try {
      const url = role === "admin"
        ? `${API}/admin/requests`
        : `${API}/requests`

      const res = await axios.get(url, authHeader())

      const mapped = res.data.map((r) => ({
        id: r.request_id || r.id,
        student: r.student_name || r.student || currentUser?.name || "",
        document: r.document_name || r.document || "",
        purpose: r.purpose || "",
        contact: r.contact_info || r.contact || "",
        status: r.request_status || r.status || "Pending",
        dateRequested: r.requested_at
          ? new Date(r.requested_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
          : r.dateRequested || "",
        isDeleted: r.is_deleted || false
      }))

      setRequests(mapped)
    } catch (err) {
      console.error("Load requests failed:", err)
    }
  }

  const loadDocumentTypes = async () => {
    try {
      const res = await axios.get(`${API}/documents`, authHeader())
      const types = res.data

      if (types && types.length > 0) {
        setDocumentTypes(types.map((t) => t.document_name))
        setDocumentType(types[0].document_name)

        const map = {}
        types.forEach((t) => {
          map[t.document_name] = t.document_type_id
        })

        setDocumentTypeMap(map)
      }
    } catch (err) {
      console.error("Load document types failed:", err)
    }
  }

  const activeRequests = requests.filter((request) => !request.isDeleted)

  const filteredRequests = activeRequests.filter((request) =>
    request.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogin = async (e) => {
    e.preventDefault()

    const email = e.target.email.value
    const password = e.target.password.value

    try {
      const res = await axios.post(`${API}/auth/login`, { email, password })

      const user = res.data.user
      const token = res.data.token

      if (user.role !== role) {
        alert(`This is a ${user.role} account. Please select the correct role.`)
        return
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      setCurrentUser(user)
      setRole(user.role)
      setShowPassword(false)

      if (user.role === "admin") {
        setPage("adminDashboard")
      } else {
        setPage("studentDashboard")
      }
    } catch (err) {
      alert("Invalid email or password.")
    }
  }

  const handleSubmitRequest = async () => {
    if (purpose.trim() === "" || contactInfo.trim() === "") {
      alert("Please fill in all fields.")
      return
    }

    try {
      const typeId = documentTypeMap[documentType]

      await axios.post(`${API}/requests`, {
        documentTypeId: typeId,
        purpose,
        contactInfo,
        quantity: 1
      }, authHeader())

      await loadRequests()

      setDocumentType(documentTypes[0] || "Transcript of Records")
      setPurpose("")
      setContactInfo("")
      setPage("studentDashboard")
    } catch (err) {
      const newRequest = {
        id: requests.length + 1,
        student: currentUser?.name || "Student",
        document: documentType,
        purpose,
        contact: contactInfo,
        status: "Pending",
        dateRequested: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        isDeleted: false
      }

      setRequests([...requests, newRequest])
      setDocumentType("Transcript of Records")
      setPurpose("")
      setContactInfo("")
      setPage("studentDashboard")
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API}/admin/requests/${id}`, {
        status: newStatus
      }, authHeader())
    } catch (err) {
      console.error("Update failed:", err)
    }

    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    )
  }

  const softDeleteRequest = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this request?")

    if (!confirmDelete) return

    try {
      await axios.delete(`${API}/admin/requests/${id}`, authHeader())
    } catch (err) {
      console.error("Delete failed:", err)
    }

    setRequests(
      requests.map((request) =>
        request.id === id ? { ...request, isDeleted: true } : request
      )
    )
  }

  const addDocumentType = async () => {
    if (newDocumentType.trim() === "") {
      alert("Please enter a document type.")
      return
    }

    try {
      await axios.post(`${API}/documents`, {
        document_name: newDocumentType
      }, authHeader())

      await loadDocumentTypes()
    } catch (err) {
      setDocumentTypes([...documentTypes, newDocumentType])
    }

    setNewDocumentType("")
  }

  const deleteDocumentType = async (typeToDelete) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete "${typeToDelete}"?`
    )

    if (!confirmDelete) return

    const typeId = documentTypeMap[typeToDelete]

    try {
      if (typeId) {
        await axios.delete(`${API}/documents/${typeId}`, authHeader())
      }

      await loadDocumentTypes()
    } catch (err) {
      setDocumentTypes(documentTypes.filter((type) => type !== typeToDelete))
    }
  }

  const getStatusClass = (status) => {
    if (status === "Pending") return "status pending"
    if (status === "Approved") return "status approved"
    if (status === "Rejected") return "status rejected"
    if (status === "Processing") return "status processing"
    if (status === "Ready for Pickup") return "status ready"
    if (status === "Released") return "status released"
    return "status"
  }

  const logout = () => {
    const confirmLogout = confirm("Are you sure you want to logout?")

    if (!confirmLogout) return

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setCurrentUser(null)
    setPage("login")
    setRole("student")
    setShowPassword(false)
  }

  if (page === "login") {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>Document Request System</h1>
          <p>Sign in to your account</p>

          <form onSubmit={handleLogin}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />

            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              required
            />

            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              Show password
            </label>

            <label>Login As</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit">Sign In</button>
          </form>

          <small>For students and admin staff</small>
        </div>
      </div>
    )
  }

  if (page === "requestForm") {
    return (
      <div className="dashboard">
        <div className="navbar">
          <h2>Document Request System</h2>
          <button onClick={() => setPage("studentDashboard")}>Back</button>
        </div>

        <div className="dashboard-content">
          <h1>Submit Document Request</h1>

          <div className="form-card">
            <label>Document Type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              {documentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            <label>Purpose</label>
            <textarea
              placeholder="Enter purpose of request"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            ></textarea>

            <label>Contact Information</label>
            <input
              type="text"
              placeholder="09123456789 or email"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
            />

            <button onClick={handleSubmitRequest}>Submit Request</button>
          </div>
        </div>
      </div>
    )
  }

  if (page === "documentTypes") {
    return (
      <div className="dashboard">
        <div className="navbar">
          <h2>Document Types</h2>
          <button onClick={() => setPage("adminDashboard")}>Back</button>
        </div>

        <div className="dashboard-content">
          <h1>Manage Document Types</h1>

          <div className="form-card">
            <label>Add New Document Type</label>
            <input
              type="text"
              placeholder="Example: Certificate of Graduation"
              value={newDocumentType}
              onChange={(e) => setNewDocumentType(e.target.value)}
            />

            <button onClick={addDocumentType}>Add Document Type</button>
          </div>

          <br />

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Document Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {documentTypes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-records">
                    No document types found.
                  </td>
                </tr>
              ) : (
                documentTypes.map((type, index) => (
                  <tr key={type}>
                    <td>{index + 1}</td>
                    <td>{type}</td>
                    <td>
                      <button className="delete-btn" onClick={() => deleteDocumentType(type)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (page === "history") {
    return (
      <div className="dashboard">
        <div className="navbar">
          <h2>Request History</h2>
          <button
            onClick={() =>
              role === "admin"
                ? setPage("adminDashboard")
                : setPage("studentDashboard")
            }
          >
            Back
          </button>
        </div>

        <div className="dashboard-content">
          <h1>Request History</h1>

          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Document</th>
                <th>Purpose</th>
                <th>Contact</th>
                <th>Date Requested</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {activeRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-records">
                    No records found.
                  </td>
                </tr>
              ) : (
                activeRequests.map((request) => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.student}</td>
                    <td>{request.document}</td>
                    <td>{request.purpose}</td>
                    <td>{request.contact}</td>
                    <td>{request.dateRequested}</td>
                    <td>
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (page === "adminDashboard") {
    return (
      <div className="dashboard">
        <div className="navbar">
          <h2>Admin Dashboard</h2>
          <button onClick={logout}>Logout</button>
        </div>

        <div className="dashboard-content">
          <h1>Manage Document Requests</h1>

          <div className="dashboard-cards">
            <div className="card">
              <h3>Total</h3>
              <p>{activeRequests.length}</p>
            </div>

            <div className="card">
              <h3>Pending</h3>
              <p>{activeRequests.filter((r) => r.status === "Pending").length}</p>
            </div>

            <div className="card">
              <h3>Processing</h3>
              <p>{activeRequests.filter((r) => r.status === "Processing").length}</p>
            </div>

            <div className="card">
              <h3>Released</h3>
              <p>{activeRequests.filter((r) => r.status === "Released").length}</p>
            </div>
          </div>

          <div className="top-actions">
            <button className="history-btn" onClick={() => setPage("history")}>
              View Request History
            </button>

            <button className="document-type-btn" onClick={() => setPage("documentTypes")}>
              Manage Document Types
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search student, document, contact, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Document</th>
                <th>Purpose</th>
                <th>Contact</th>
                <th>Date Requested</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-records">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>#{request.id}</td>
                    <td>{request.student}</td>
                    <td>{request.document}</td>
                    <td>{request.purpose}</td>
                    <td>{request.contact}</td>
                    <td>{request.dateRequested}</td>
                    <td>
                      <span className={getStatusClass(request.status)}>
                        {request.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button onClick={() => updateStatus(request.id, "Approved")}>Approve</button>
                      <button onClick={() => updateStatus(request.id, "Rejected")}>Reject</button>
                      <button onClick={() => updateStatus(request.id, "Processing")}>Processing</button>
                      <button onClick={() => updateStatus(request.id, "Ready for Pickup")}>Ready</button>
                      <button onClick={() => updateStatus(request.id, "Released")}>Release</button>
                      <button className="delete-btn" onClick={() => softDeleteRequest(request.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Document Request System</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="dashboard-content">
        <h1>Student Dashboard</h1>

        <div className="dashboard-cards">
          <div className="card">
            <h3>Total Requests</h3>
            <p>{activeRequests.length}</p>
          </div>

          <div className="card">
            <h3>Pending</h3>
            <p>{activeRequests.filter((r) => r.status === "Pending").length}</p>
          </div>

          <div className="card">
            <h3>Ready</h3>
            <p>{activeRequests.filter((r) => r.status === "Ready for Pickup").length}</p>
          </div>

          <div className="card">
            <h3>Released</h3>
            <p>{activeRequests.filter((r) => r.status === "Released").length}</p>
          </div>
        </div>

        <div className="top-actions">
          <button className="new-request-btn" onClick={() => setPage("requestForm")}>
            + New Document Request
          </button>

          <button className="history-btn" onClick={() => setPage("history")}>
            View Request History
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Document</th>
              <th>Purpose</th>
              <th>Contact</th>
              <th>Date Requested</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {activeRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-records">
                  No records found.
                </td>
              </tr>
            ) : (
              activeRequests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>{request.document}</td>
                  <td>{request.purpose}</td>
                  <td>{request.contact}</td>
                  <td>{request.dateRequested}</td>
                  <td>
                    <span className={getStatusClass(request.status)}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App