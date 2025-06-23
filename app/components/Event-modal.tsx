"use client"
import { motion, AnimatePresence } from "framer-motion"
import { XCircle } from "lucide-react"
import AddEventForm from "./add-event-form"
import EditEventForm from "./edit-event-form"

type EventType = {
  event_id: number
  admin_id: string
  title: string
  description: string
  start_date: string
  end_date: string | null
  image_url: string | null
  created_at: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  editingEvent: EventType | null
  onEventSaved: (message: string) => void
  onError: (error: string) => void
}

export default function EventModal({ isOpen, onClose, editingEvent, onEventSaved, onError }: EventModalProps) {
  const handleEventSaved = (message: string) => {
    onEventSaved(message)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex justify-center items-center px-4 py-8 bg-black/30 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl p-8 overflow-y-auto max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-500 dark:text-gray-400 hover:text-red-500 transition duration-200 hover:scale-110 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 z-10"
          >
            <XCircle className="w-7 h-7" />
          </button>

          {/* Form Content */}
          {editingEvent ? (
            <EditEventForm event={editingEvent} onEventSaved={handleEventSaved} onError={onError} />
          ) : (
            <AddEventForm onEventSaved={handleEventSaved} onError={onError} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
