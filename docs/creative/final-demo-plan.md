# Creative demo plan

## The story

**One athlete photo becomes a game-day card and banner.** Livepeer removes the
photo background and generates a scene. A browser agent helps direct the scene
and update event details. The person reviews each cost and chooses the result.
Batch Relay keeps the athlete, logo, and text editable, then exports both sizes.

Target a 90–120 second video. Record the working application, not slides.

| Time | Show | Say or caption |
| --- | --- | --- |
| 0:00–0:10 | Batch Relay home, then `/creative` with the same brand | "Game-day artwork usually needs several sizes and last-minute changes." |
| 0:10–0:30 | Source athlete photo; request cutout; show estimate and human approval | "Livepeer processes a copy. The original stays in the local project." |
| 0:30–0:55 | Ask the browser agent for a background with headline space; show its WebMCP handoff, estimate, and approval | "The agent directs the media job. A person approves its cost." |
| 0:55–1:15 | Review and apply the completed candidate; show separate athlete, logo, and text layers | "The generated background changes. The supplied layers remain editable." |
| 1:15–1:35 | Change the date through the agent, move a layer, switch to banner | "These revisions reuse the approved image and do not request another render." |
| 1:35–1:55 | Export the 1080 × 1350 card and 1920 × 1080 banner; show both files | "One approved scene, two ready-to-use outputs." |

Use a real completed job in the recording if the participant connection is
available. If a cached result is shown, label it as a previously generated
sample. Edit out waiting time with an honest cut; do not imply an instant render.
Never show endpoint values, access codes, session secrets, or private project
data in the video.

## Agent prompts to rehearse

> Inspect this Creative project. Propose a warm arena background with clean
> space behind the event title. Keep the athlete photo, logo, and text as
> separate layers. Stop at the estimate so I can decide whether to render.

After reviewing and applying the result:

> Change the event date to October 24, switch to the banner layout, and export
> the banner PNG. Keep the approved background.

The first prompt makes the agent's Livepeer role visible. The second proves
that an ordinary event change reuses the completed media job.

## Finish in this order

1. Verify the new `/creative` branding and the full card and banner layout in
   a fresh desktop browser. Check mobile for overflow and readable controls.
2. Configure the standalone Atumera app's server-only Livepeer participant
   connection. Confirm one estimate, one human-approved cutout or background
   job, candidate review, and a successful export. Do not spend on repeated
   renders just to polish the recording.
3. Rehearse the exact agent prompt and WebMCP calls, then record the shortest
   reliable path. Capture the estimate and approval clearly.
4. Verify both downloaded PNG dimensions, sample-asset permissions, and the
   final video URL. Prepare a new, standalone public repository URL for this
   Atumera project. The current local repository has no remote. Do not push to
   the WebMCP OpenAI Hackathon repository or change its main branch.
5. Submit the repository and video links with the organizer's six-digit code;
   save the on-screen receipt. The [official submission form](https://atumera.com/hackathon/submit)
   lists those links and the code as required inputs. The [event page](https://atumera.com/hackathon)
   gives the deadline as September 24, 2026 at 23:59 Europe/Athens.

The public event page points to a separate participant pack for detailed rules
and judging criteria. Confirm those details with the organizer before making an
eligibility claim. A local build and a recorded demo do not establish a saved
submission.
