import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Select from "react-select";

const Account = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);
  const [points, setPoints] = useState(0);
  const [client, setClient] = useState(true);
  const [userList, setUserList] = useState([]);
  const [clientName, setClientName] = useState(null);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    getProfile();
    getUserList();
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
console.log(user);
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

  const getUserList = async (users) => {
    try {
      let { data, error, status } = await supabase.from("profiles").select();
      setUserList(
        data
          .filter(({ userType }) => userType !== "artist\r\n")
          .map(({ username }) => ({ value: username, label: username }))
      );
    } catch (error) {
      alert(error.message);
    } finally {
    }
  };

  const displayPoints = async (user) => {
    try {
      let { data, error, status } = await supabase
        .from("profiles")
        .select("username, points");
      data.forEach((element) => {
        if (element.username === user.value) {
          setPoints(element.points);
          setClientName(user.value);
        }
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setShowPoints(true);
    }
  };

  const addPoints = async () => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .update({ points: points + 1 })
        .match({ username: clientName });
    } catch (error) {
      alert(error.message);
    } finally {
      setPoints(points + 1);
    }
  };

  const removePoints = async () => {
    try {
      let { data, error } = await supabase
        .from("profiles")
        .update({ points: points - 1 })
        .match({ username: clientName });
    } catch (error) {
      alert(error.message);
    } finally {
      setPoints(points - 1);
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px solid grey',
      color: state.isSelected ? 'red' : 'black',
      padding: 10,
    })
  }

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
            <button className="button block primary button--custom" disabled={loading}>
              Update profile
            </button>
          </div>
        </form>
      ) : (
        <div className="artist-page">
          <h1 className="header">ROXYCILS & BEAUTÉ</h1>
          <p>Search for a client</p>
          <div>
            <Select styles={customStyles} options={userList} onChange={displayPoints} />
          </div>
          {showPoints ? (
            <div>
              <p>Point Balance: {points}</p>
              <div style={{ display: "flex" }}>
                <div>
                  <button onClick={removePoints}>-</button>
                </div>
                <div>
                  <button onClick={addPoints}>+</button>
                </div>
              </div>
            </div>
          ) : (
            <div></div>
          )}
        </div>
      )}

      <button
        type="button"
        className="button block button--custom"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Account;
