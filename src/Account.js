import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

const Account = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [points, setPoints] = useState(0);
  const [client, setClient] = useState(true);

  useEffect(() => {
    getProfile();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const user = supabase.auth.user();

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, points, userType`)
        .eq("id", user.id)
        .single();

      if (data.userType !== "client") {
        setClient(false);
      }

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setPoints(data.points);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const user = supabase.auth.user();

      const updates = {
        id: user.id,
        username,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates, {
        returning: "minimal", // Don't return the value after inserting
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div aria-live="polite">
      {loading ? (
        "Saving ..."
      ) : client ? (
        <form onSubmit={updateProfile} className="form-widget">
          <div>Email: {session.user.email}</div>
          <div>
            <label htmlFor="username">Name</label>
            <input
              id="username"
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <div>
              <p>Points Balance: {points}</p>
            </div>
            <button className="button block primary" disabled={loading}>
              Update profile
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p>This is the Artist Page!!!</p>
    
        </div>
      )}

      <button
        type="button"
        className="button block"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Account;
