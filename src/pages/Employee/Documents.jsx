import { useState } from "react";

const Documents = () => {
  const [documents, setDocuments] = useState([]);

  return (
    <div className="p-4 w-full">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold mb-4">
        Documents
      </h1>

      {/* Upload Section */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <h2 className="font-semibold mb-2">Upload Document</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            className="border rounded px-3 py-2 w-full"
          />

          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
            Upload
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PDF, JPG, PNG
        </p>
      </div>

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No documents uploaded</p>
          <p className="text-sm">
            Upload your first document to get started
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg">
                  {doc.name}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  Type: {doc.type}
                </p>

                <p className="text-sm text-gray-500">
                  Uploaded: {doc.date}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-gray-100 px-3 py-2 rounded hover:bg-gray-200 text-sm">
                  View
                </button>

                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;