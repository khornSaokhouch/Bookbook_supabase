// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Changed from next/router
// import { useParams } from 'next/navigation'; //Import useParams
// import { supabase } from "../lib/supabaseClient";

// const AddEvent = () => {
//   const router = useRouter();
//   const params = useParams(); // Use useParams instead of useRouter().query
//   const { event_id } = params; // Access event_id from params
//   const [event, setEvent] = useState(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [loading, setLoading] = useState(true);

//   // Fetch event details
//   useEffect(() => {
//     if (event_id) {
//       const fetchEvent = async () => {
//         setLoading(true); // Set loading to true at the beginning of the fetch
//         try {
//           const { data, error } = await supabase
//             .from("event")
//             .select("*")
//             .eq("event_id", event_id)
//             .single();

//           if (error) {
//             console.error("Error fetching event:", error);
//           } else {
//             setEvent(data);
//             setTitle(data.title || ""); // Handle potential null values
//             setDescription(data.description || "");
//             setStartDate(data.start_date || "");
//             setEndDate(data.end_date || "");
//             setImageUrl(data.image_url || "");
//           }
//         } catch (error) {
//           console.error("An error occurred:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchEvent();
//     }
//   }, [event_id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const { error } = await supabase
//         .from("event")
//         .update({ title, description, start_date: startDate, end_date: endDate, image_url: imageUrl })
//         .eq("event_id", event_id);

//       if (error) {
//         console.error("Error updating event:", error);
//         // Optionally set an error state to display an error message
//       } else {
//         router.push(`/admin/${event_id}/events`); // Use backticks for template literals
//         // Optionally set a success state to display a success message
//       }
//     } catch (error) {
//       console.error("An error occurred:", error);
//       // Optionally set an error state to display an error message
//     }
//   };

//   if (loading) return <div>Loading...</div>;

//   if (!event) return <div>Event not found.</div>;  //Handle null event

//   return (
//     <div className="max-w-2xl mx-auto p-6 shadow-md rounded-lg">
//       <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//             Title
//           </label>
//           <input
//             type="text"
//             id="title"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//             className="mt-2 p-3 w-full border rounded-lg"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//             Description
//           </label>
//           <textarea
//             id="description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//             className="mt-2 p-3 w-full border rounded-lg"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
//             Start Date
//           </label>
//           <input
//             type="datetime-local"
//             id="startDate"
//             value={startDate}
//             onChange={(e) => setStartDate(e.target.value)}
//             required
//             className="mt-2 p-3 w-full border rounded-lg"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
//             End Date
//           </label>
//           <input
//             type="datetime-local"
//             id="endDate"
//             value={endDate}
//             onChange={(e) => setEndDate(e.target.value)}
//             required
//             className="mt-2 p-3 w-full border rounded-lg"
//           />
//         </div>
//         <div className="mb-4">
//           <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
//             Image URL
//           </label>
//           <input
//             type="text"
//             id="imageUrl"
//             value={imageUrl}
//             onChange={(e) => setImageUrl(e.target.value)}
//             className="mt-2 p-3 w-full border rounded-lg"
//           />
//         </div>
//         <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
//           Save Changes
//         </button>
//       </form>
//     </div>
//   );
// };

// export default AddEvent;