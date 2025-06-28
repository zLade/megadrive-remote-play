# Megadrive-remote-play

Remotely play on a **Sega Mega Drive / Genesis** with a **6‑button controller** using a Raspberry Pi and an **ULN2803A**. No need to reverse‑engineer the DB‑9 protocol—the Pi simply "presses" the physical pads for you.

---

## Why This Approach?

| Challenge             | Directly on DB‑9                               | **This project**                          |
| --------------------- | ---------------------------------------------- | ----------------------------------------- |
| 5 V logic on console  | Requires level‑shifters                        | Pi is isolated by ULN2803A                |
| 6‑button multiplexing | Time‑critical TH pulses, bus direction changes | Ignore protocol—just short the button pad |
| Safety                | 5 V → dead GPIO                                | ULN2803A sinks up to 500 mA, 50 V max     |
| Software              | Real‑time state machine                        | One `HIGH` / `LOW` per button             |

---

## Hardware

| Qty | Item                                        | Notes             |
| --- | ------------------------------------------- | ----------------- |
| 1   | Raspberry Pi (any model with GPIO)          | 3.3 V logic       |
| 2   | ULN2803A (8‑channel Darlington array)       | DIP‑18 or SOIC‑18 |
| 1   | Sega Mega Drive/Genesis 6‑button controller | Original or clone |
| 1   | Small proto‑board / breadboard              | For ULN & header  |
| —   | Hook‑up wire + solder                       | —                 |

> **Grounds matter**: Pi **GND**, ULN **COM**, and gamepad **GND** must be tied together.

### Pin Map (default)

| Button | Pi GPIO | Pi Pin| ULN IN | ULN OUT → Pad |
| ------ | ------- | ------ | ------ | ------------- |
| Up     | 4       | 7      | U1‑1   | Up            |
| Down   | 17      | 11     | U1‑2   | Down          |
| Left   | 27      | 13     | U1‑3   | Left          |
| Right  | 22      | 15     | U1‑4   | Right         |
| X      | 23      | 16     | U2‑1   | A             |
| Y      | 24      | 18     | U2‑2   | B             |
| Z      | 25      | 22     | U2‑3   | C             |
| A      | 5       | 29     | U2‑4   | Start         |
| B      | 6       | 31     | U2‑5   | X             |
| C      | 13      | 33     | U2‑6   | Y             |
| Start  | 16      | 36     | U2‑7   | Z             |
| Mode   | 26      | 37     | U2‑8   | Mode          |

<center><img src="https://raw.githubusercontent.com/zLade/megadrive-remote-play/refs/heads/main/images/mapping.png" width="512" height="256"></center>


---

## Soldering the Gamepad

1. Open the controller; locate the copper pads for each button.
2. Lightly scrape the solder mask where necessary.
3. Tin each pad and solder a thin wire—**one per button plus one common GND**.
4. Route the wires out through a strain‑relieved hole.

<center><img src="https://raw.githubusercontent.com/zLade/megadrive-remote-play/refs/heads/main/images/gpio-breadboard-pcb.jpg" width="512" height="750"></center>

---

## Software

### Prerequisites

* **Raspberry Pi OS** (bookworm light)
* `libgpiod` (`sudo apt install gpiod`)
* Node.js ≥ 18

### API

| Method | Endpoint | Query          | Effect               |
| ------ | -------- | -------------- | -------------------- |
| `POST` | `/down`  | `btn=A`        | Hold button          |
| `POST` | `/up`    | `btn=A`        | Release button       |


Buttons are case‑insensitive (`a`, `B`, `start`, …).


---

## How It Works

```
Pi GPIO (3.3 V) ──┐
                  │ HIGH      ↓ current gain (~1000)
           ULN2803A Darlington pair
                  │ saturation ≈ 0.2 V
Gamepad pad  ─────┘─────►  GND  (≃ button pressed)
```

* `GPIO = 1` → transistor *sinks* the line → **button closed**.
* `GPIO = 0` → transistor open → line floats/pulled‑up by gamepad → **button open**.

The ULN’s diodes & high current rating protect the Pi from mistakes or inductive loads.

---

## How to launch it

After installation, connect with SSH on your Raspberry Pi and use
```
sudo node server.js
```

## Web Interface

It's use the native Gamepad API from modern web browser so it will automaticaly detect your controller

<center><img src="https://raw.githubusercontent.com/zLade/megadrive-remote-play/refs/heads/main/images/web-interface-mapping.png" width="512" height="512"></center>
<center><img src="https://raw.githubusercontent.com/zLade/megadrive-remote-play/refs/heads/main/images/web-interface-controller.png" width="512" height="256"></center>



## Roadmap

* [ ] Support for SNES/Neo‑Geo (different wiring)

Contributions welcome—issue reports, pull requests, or just ⭐ are appreciated!

---

## License

MIT License — see [`LICENSE`](LICENSE) for details.

---

> *Made with \:heart: for accessibility, tool‑assisted runs, and weird hardware hacks.*
