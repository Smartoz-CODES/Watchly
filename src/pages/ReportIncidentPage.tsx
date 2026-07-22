import { useState } from "react";

const ReportIncidentPage = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  return (
    <div>
      <h1>Report an Incident</h1>

      <form>
        <div>
          <label htmlFor="category">Category</label>
          <input
            id="category"
            type="text"
            placeholder="Enter incident category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Describe what happened"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportIncidentPage;
