"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GamesView() {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#ECECEC' }}>Therapeutic Games</h2>
            <p className="text-sm" style={{ color: '#BDBDBD' }}>Interactive games designed for therapeutic purposes</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Game Cards */}
              <div className="p-4 rounded-lg border border-gray-700/50" style={{ background: '#303030' }}>
                <h3 className="font-medium mb-2" style={{ color: '#ECECEC' }}>Mindfulness Journey</h3>
                <p className="text-sm mb-4" style={{ color: '#BDBDBD' }}>A calming adventure through peaceful landscapes</p>
                <Button
                  className="w-full"
                  style={{ background: '#404040', color: '#ECECEC' }}
                  onClick={() => {}}
                >
                  Play Game
                </Button>
              </div>
              <div className="p-4 rounded-lg border border-gray-700/50" style={{ background: '#303030' }}>
                <h3 className="font-medium mb-2" style={{ color: '#ECECEC' }}>Emotion Explorer</h3>
                <p className="text-sm mb-4" style={{ color: '#BDBDBD' }}>Interactive game to explore and understand emotions</p>
                <Button
                  className="w-full"
                  style={{ background: '#404040', color: '#ECECEC' }}
                  onClick={() => {}}
                >
                  Start Journey
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}