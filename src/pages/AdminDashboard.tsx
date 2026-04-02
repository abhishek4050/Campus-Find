import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import ApprovedItems from "../components/ApprovedItems";
import Navbar from "../components/Navbar";

// a team project-by Ninja_Crew (abhishek panwar & sushant giri)
interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
}

type RequestStatus = "pending" | "approved" | "rejected" | "done";
type ClaimStatus = "requested" | "approved" | "rejected" | "collected";

type StudentRequest = {
  id: number;
  requestType: "lost" | "found";
  itemName: string;
  location: string;
  description: string;
  image: string;
  status: RequestStatus;
  submittedBy: string;
};

type RecoveryClaim = {
  id: number;
  itemId: number;
  itemName: string;
  claimantUsername: string;
  proofText: string;
  status: ClaimStatus;
};

const AdminDashboard = ({ username, onLogout }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [claims, setClaims] = useState<RecoveryClaim[]>([]);

  useEffect(() => {
    loadRequests();
    loadClaims();

    const handleDataUpdate = () => {
      loadRequests();
      loadClaims();
    };

    window.addEventListener("storage", handleDataUpdate);
    window.addEventListener("campusfind_data_updated", handleDataUpdate);

    return () => {
      window.removeEventListener("storage", handleDataUpdate);
      window.removeEventListener("campusfind_data_updated", handleDataUpdate);
    };
  }, []);

  const loadRequests = () => {
    const savedRequests: StudentRequest[] = JSON.parse(
      localStorage.getItem("campusfind_requests") || "[]",
    );
    setRequests(savedRequests);
  };

  const loadClaims = () => {
    const savedClaims: RecoveryClaim[] = JSON.parse(
      localStorage.getItem("campusfind_claims") || "[]",
    );
    setClaims(savedClaims);
  };

  const updateRequestStatus = (
    id: number,
    newStatus: Exclude<RequestStatus, "pending">,
  ) => {
    const savedRequests: StudentRequest[] = JSON.parse(
      localStorage.getItem("campusfind_requests") || "[]",
    );

    const updatedRequests: StudentRequest[] = savedRequests.map((request) =>
      request.id === id ? { ...request, status: newStatus } : request,
    );

    localStorage.setItem("campusfind_requests", JSON.stringify(updatedRequests));
    window.dispatchEvent(new Event("campusfind_data_updated"));
    setRequests(updatedRequests);
  };

  const updateClaimStatus = (
    claimId: number,
    itemId: number,
    newStatus: Exclude<ClaimStatus, "requested">,
  ) => {
    const savedClaims: RecoveryClaim[] = JSON.parse(
      localStorage.getItem("campusfind_claims") || "[]",
    );

    let updatedClaims: RecoveryClaim[] = savedClaims.map((claim) =>
      claim.id === claimId ? { ...claim, status: newStatus } : claim,
    );

    if (newStatus === "approved") {
      updatedClaims = updatedClaims.map((claim) => {
        if (
          claim.itemId === itemId &&
          claim.id !== claimId &&
          claim.status === "requested"
        ) {
          return { ...claim, status: "rejected" as ClaimStatus };
        }

        return claim;
      });
    }

    localStorage.setItem("campusfind_claims", JSON.stringify(updatedClaims));

    if (newStatus === "collected") {
      const savedRequests: StudentRequest[] = JSON.parse(
        localStorage.getItem("campusfind_requests") || "[]",
      );

      const updatedRequests: StudentRequest[] = savedRequests.map((request) =>
        request.id === itemId ? { ...request, status: "done" } : request,
      );

      localStorage.setItem(
        "campusfind_requests",
        JSON.stringify(updatedRequests),
      );
      setRequests(updatedRequests);
    }

    window.dispatchEvent(new Event("campusfind_data_updated"));
    setClaims(updatedClaims);
  };

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );

  const activeItems = requests.filter(
    (request) =>
      request.status === "approved" || request.status === "rejected",
  );

  const completedItems = requests.filter(
    (request) => request.status === "done",
  );

  const recoveryClaims = claims.filter(
    (claim) => claim.status !== "collected",
  );

  const getStatusStyle = (status: RequestStatus) => {
    if (status === "pending") {
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
      };
    }

    if (status === "approved") {
      return {
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
      };
    }

    if (status === "done") {
      return {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
      };
    }

    return {
      backgroundColor: "#f8d7da",
      color: "#842029",
    };
  };

  const getClaimStatusStyle = (status: ClaimStatus) => {
    if (status === "requested") {
      return {
        backgroundColor: "#fff3cd",
        color: "#856404",
      };
    }

    if (status === "approved") {
      return {
        backgroundColor: "#d1e7dd",
        color: "#0f5132",
      };
    }

    if (status === "collected") {
      return {
        backgroundColor: "#d1ecf1",
        color: "#0c5460",
      };
    }

    return {
      backgroundColor: "#f8d7da",
      color: "#842029",
    };
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.463)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "left",
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "10px",
    border: "1px solid rgba(0,0,0,0.05)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "wheat",
        padding: "100px 20px 40px 20px",
      }}
    >
      <Navbar onLetsStart={() => {}} onLogout={onLogout} isDashboard />

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 40px auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontWeight: "900", fontSize: "3em", marginBottom: "10px", color: "#333" }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: "1.2em", fontWeight: "600", color: "#444" }}>
          Welcome, <span style={{ color: "#7e7eee" }}>{username}</span> (Admin)
        </p>
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
          backgroundColor: "rgba(255, 255, 255, 0.463)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "40px",
          borderRadius: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 style={{ marginBottom: "30px", textAlign: "center", fontWeight: "800", color: "#333" }}>
          Pending Requests
        </h2>

        {pendingRequests.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
            No pending requests at the moment.
          </p>
        ) : (
          <div style={gridStyle}>
            {pendingRequests.map((request) => (
              <div key={request.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: "700" }}>{request.itemName}</h4>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "15px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      ...getStatusStyle(request.status),
                    }}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: "0.95em", color: "#444" }}>
                  <p style={{ margin: "4px 0" }}><strong>Submitted By:</strong> {request.submittedBy}</p>
                  <p style={{ margin: "4px 0" }}><strong>Type:</strong> {request.requestType === "lost" ? "Lost" : "Found"}</p>
                  <p style={{ margin: "4px 0" }}><strong>Location:</strong> {request.location}</p>
                  <p style={{ margin: "4px 0" }}><strong>Description:</strong> {request.description}</p>
                </div>

                {request.image && (
                  <img
                    src={request.image}
                    alt={request.itemName}
                    style={imageStyle}
                  />
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => updateRequestStatus(request.id, "approved")}
                    style={{ flex: 1, borderRadius: "8px", fontWeight: "600" }}
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => updateRequestStatus(request.id, "rejected")}
                    style={{ flex: 1, borderRadius: "8px", fontWeight: "600" }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
          backgroundColor: "rgba(255, 255, 255, 0.463)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "40px",
          borderRadius: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 style={{ marginBottom: "30px", textAlign: "center", fontWeight: "800", color: "#333" }}>
          Recovery Claims
        </h2>

        {recoveryClaims.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
            No active recovery claims.
          </p>
        ) : (
          <div style={gridStyle}>
            {recoveryClaims.map((claim) => (
              <div key={claim.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <h4 style={{ margin: 0, fontWeight: "700" }}>{claim.itemName}</h4>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "15px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      ...getClaimStatusStyle(claim.status),
                    }}
                  >
                    {claim.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: "0.95em", color: "#444" }}>
                  <p style={{ margin: "4px 0" }}><strong>Claimant:</strong> {claim.claimantUsername}</p>
                  <p style={{ margin: "4px 0" }}><strong>Proof:</strong> {claim.proofText}</p>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  {claim.status === "requested" && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() =>
                          updateClaimStatus(claim.id, claim.itemId, "approved")
                        }
                        style={{ flex: 1, borderRadius: "8px", fontWeight: "600" }}
                      >
                        Approve Claim
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          updateClaimStatus(claim.id, claim.itemId, "rejected")
                        }
                        style={{ flex: 1, borderRadius: "8px", fontWeight: "600" }}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {claim.status === "approved" && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        updateClaimStatus(claim.id, claim.itemId, "collected")
                      }
                      style={{ width: "100%", borderRadius: "8px", fontWeight: "600", backgroundColor: "#7e7eee", border: "none" }}
                    >
                      Mark as Collected
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
        }}
      >
        <ApprovedItems />
      </div>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px auto",
          backgroundColor: "rgba(255, 255, 255, 0.463)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "40px",
          borderRadius: "30px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 style={{ marginBottom: "30px", textAlign: "center", fontWeight: "800", color: "#333" }}>
          Request History
        </h2>

        <div style={gridStyle}>
          {activeItems.map((request) => (
            <div key={request.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0, fontWeight: "700" }}>{request.itemName}</h4>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    ...getStatusStyle(request.status),
                  }}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: "4px 0", fontSize: "0.9em" }}><strong>Submitted By:</strong> {request.submittedBy}</p>
            </div>
          ))}

          {completedItems.map((request) => (
            <div key={request.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h4 style={{ margin: 0, fontWeight: "700" }}>{request.itemName}</h4>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "15px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    ...getStatusStyle(request.status),
                  }}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: "4px 0", fontSize: "0.9em" }}><strong>Submitted By:</strong> {request.submittedBy}</p>
              <p style={{ margin: "4px 0", fontSize: "0.9em", color: "green", fontWeight: "bold" }}>Handed Over Successfully</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;