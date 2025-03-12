"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function VRView() {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#ECECEC' }}>Virtual Reality</h2>
            <p className="text-sm" style={{ color: '#BDBDBD' }}>Explore VR experiences and sessions</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* VR Experience Cards */}
              <div className="p-4 rounded-lg border border-gray-700/50" style={{ background: '#303030' }}>
                <h3 className="font-medium mb-2" style={{ color: '#ECECEC' }}>Relaxation Session</h3>
                <p className="text-sm mb-4" style={{ color: '#BDBDBD' }}>Immersive meditation and relaxation experience</p>
                <Button
                  className="w-full"
                  style={{ background: '#404040', color: '#ECECEC' }}
                  onClick={() => {}}
                >
                  Start Experience
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-gray-700/50" style={{ background: '#303030' }}>
                <h3 className="font-medium mb-2" style={{ color: '#ECECEC' }}>Therapy Space</h3>
                <p className="text-sm mb-4" style={{ color: '#BDBDBD' }}>Virtual therapy environment</p>
                <Button
                  className="w-full"
                  style={{ background: '#404040', color: '#ECECEC' }}
                  onClick={() => {}}
                >
                  Enter Space
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}