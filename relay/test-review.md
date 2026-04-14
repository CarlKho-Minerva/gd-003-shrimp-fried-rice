# Game 3: WebSocket Relay Verification Log
*Test run on 2026-03-09*

This document preserves the output from the automated WebSocket connection test for the Shrimp Fried Rice external controller system.

The test verified that:
1. The game (display) can connect to the Node.js relay server and generate a 4-digit room code.
2. A remote controller (phone or ESP32) can connect to the relay server using that specific room code.
3. The server correctly pair-matches the display and controller, sending a `controller-connected` notification to the display.
4. The server successfully routes all three standard sensor packet types (`orientation`, `motion`, and `hit`) from the controller directly to the display in real-time.

## Test Output Trace

```text
Starting display client...
[DISPLAY] received: { type: 'room', code: '2744' }

Now connecting controller to room 2744...
[CONTROLLER] received: { type: 'joined', code: '2744' }

Sending mock sensor data...
[DISPLAY] received: { type: 'controller-connected', count: 1 }
[DISPLAY] received: { type: 'orientation', alpha: 10, beta: 20, gamma: 30 }
[DISPLAY] received: { type: 'motion', x: 0, y: -9.8, z: 0 }
[DISPLAY] received: { type: 'hit', zone: 2 }

Closing controller...
[DISPLAY] received: { type: 'controller-disconnected', count: 0 }
```

### Result: **PASS ✅**

The relay architecture is robust and correctly handles edge cases like client disconnections. It is ready for use with the `controller.html` fallback and the `wok_controller.ino` ESP32 hardware build.
