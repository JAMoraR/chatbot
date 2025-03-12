"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppointmentsView() {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#ECECEC' }}>Appointments</h2>
            <p className="text-sm" style={{ color: '#BDBDBD' }}>Schedule and manage your appointments</p>
          </div>
          <div className="space-y-4">
            {/* Placeholder for appointments list */}
            <div className="p-4 rounded-lg border border-gray-700/50" style={{ background: '#303030' }}>
              <p className="text-sm" style={{ color: '#ECECEC' }}>No appointments scheduled</p>
            </div>
            <Button
              className="w-full"
              style={{ background: '#404040', color: '#ECECEC' }}
              onClick={() => {}}
            >
              Schedule New Appointment
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}