import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, useParams } from 'react-router-dom';
// import {useParams} from 'react';

const UserDetails = ({ match }) => {
    const { userId } = useParams(); // Get the userId from the URL parameter
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//   const userId = match.params.userId; // The userId will be passed in the URL

  useEffect(() => {
    // Fetch the resumes for the user by userId
    const fetchResumes = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/admin/resumes/${userId}`);
        setResumes(response.data.resumes);
      } catch (err) {
        setError('Error fetching resumes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">User Resumes</h1>

      {resumes.length === 0 ? (
        <p>No resumes found for this user.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-700 shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-600">
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Resume Title</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Created at</th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((resume) => (
                <tr key={resume.id} className="border-t border-gray-600">
                  <td className="px-4 py-2 text-sm text-gray-300">{resume.resume_title}</td>
                  <td className="px-4 py-2 text-sm text-gray-300">{resume.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
