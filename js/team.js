// Shared colleagues across every sim. Escalation targets: T2 (bob, priya) and IR (marcus, imani).
(function (g) {
  const TEAM = [
    {
      id: 'bob', name: 'Bob Harlan', role: 'SOC Analyst II', group: 'T2', escalatable: 'T2',
      color: '#3987e5', initials: 'BH',
      bio: '6 years in SOC. Ex-helpdesk. Friendly, terse, hates vague tickets. Drinks cold brew by the gallon.',
      fpOpen: ['Had a look. ', 'Okay, checked it out. ', 'Pulled the logs on this one. '],
      fpClose: ['False positive, close it out. Good instinct to check though.', 'It\'s an FP. Close it with a note and move on.', 'FP. Nothing to worry about here, close it out. Next time, a bit more detail in the note helps me check faster.'],
      tpOpen: ['Good catch. ', 'Yeah... this one is real. ', 'Glad you sent this up. '],
      tpClose: ['I\'m taking this over, keep your notes handy and don\'t touch the host.', 'Taking ownership now. Leave the ticket open and keep triaging the queue.', 'Stay on the queue, I\'ll loop IR in from here.'],
      thin: ['I need more than that. What did you actually see in the logs? Put the evidence in the ticket. I\'ll look anyway.', 'That description is a bit thin. Next time give me who, what host, what process, and why you think it\'s bad. I\'ll look anyway.']
    },
    {
      id: 'priya', name: 'Priya Nair', role: 'SOC Analyst II', group: 'T2', escalatable: 'T2',
      color: '#e87ba4', initials: 'PN',
      bio: 'Detection engineer turned T2. Thorough, writes long replies, loves a good timeline.',
      fpOpen: ['Thanks for sending this over. I went through it. ', 'Reviewed the telemetry. ', 'Looked at the surrounding events. '],
      fpClose: ['Conclusion: benign / false positive. Please close it and note the evidence you used so the next analyst can see it.', 'This is a false positive. I\'ll ask detection engineering to tune the rule, you can close it.', 'It checks out as expected activity. Close as FP and add the reasoning to the ticket.'],
      tpOpen: ['Nice work, this is a true positive. ', 'You were right to escalate. ', 'Confirmed malicious. '],
      tpClose: ['I\'m opening an incident and pulling in IR. Please don\'t close any related alerts and note any new ones.', 'Taking this as the incident owner. Keep an eye out for related alerts and link them to the case.', 'Escalating to IR now, please add any related alerts to the case.'],
      thin: ['Your description is light on detail. Include the host, user, process chain, and indicators. I did the digging for you this time.', 'Please add more context next time: what triggered, what you checked, and why it\'s suspicious. I looked into it regardless.']
    },
    {
      id: 'marcus', name: 'Marcus Webb', role: 'Incident Response Lead', group: 'IR', escalatable: 'IR',
      color: '#eb6834', initials: 'MW',
      bio: 'Ex-military cyber. Calm voice, short sentences. If he calls you, it\'s a long day.',
      fpOpen: ['Reviewed. ', 'Looked at it. '],
      fpClose: ['Not an incident. Please route through T2 unless you have confirmed compromise. Close it as an FP.', 'Nothing for IR here. It\'s a false positive, T2 can triage these first. Close it.'],
      tpOpen: ['Understood. ', 'Received. '],
      tpClose: ['IR is engaged. I\'m calling the user\'s manager and having the endpoint contained. Don\'t power anything off, keep the evidence.', 'This is an incident. We\'ll isolate and start the scoping. Keep the ticket open and send me anything new.'],
      thin: ['Your handoff is too vague for IR. Give me host, user, timeline and indicators next time. I\'ll start digging anyway.']
    },
    {
      id: 'imani', name: 'Imani Brooks', role: 'IR Engineer', group: 'IR', escalatable: 'IR',
      color: '#1baf7a', initials: 'IB',
      bio: 'Forensics nerd. Loves memory dumps. Answers faster than anyone.',
      fpOpen: ['Quick look. ', 'Checked the host. '],
      fpClose: ['It\'s benign, no IR needed. Close as FP, and loop T2 in next time so they can sanity check first.', 'No signs of compromise, this is an FP. Close it out.'],
      tpOpen: ['Okay, that one is bad. ', 'Confirmed, this is a real compromise. '],
      tpClose: ['I\'m grabbing a memory image and isolating the host. Leave it powered on.', 'Starting containment now. I\'ll sync with Marcus. Keep notes on the timeline.'],
      thin: ['I need more than that for an IR handoff. Please add the host, user, process and timeline. I\'m checking anyway.']
    },
    {
      id: 'dana', name: 'Dana Okafor', role: 'SOC Manager', group: 'Mgmt', color: '#eda100', initials: 'DO',
      bio: 'Runs the SOC. Cares about SLAs, handovers and not being surprised.'
    },
    {
      id: 'tom', name: 'Tom Reyes', role: 'SOC Analyst I', group: 'T1', color: '#9085e9', initials: 'TR',
      bio: 'Fellow T1, same shift. Always mid-sandwich.'
    },
    {
      id: 'lena', name: 'Lena Fischer', role: 'Threat Intel Analyst', group: 'CTI', color: '#d55181', initials: 'LF',
      bio: 'Threat intel. Sends out the daily IOC digest.'
    },
    {
      id: 'sam', name: 'Sam Whitaker', role: 'IT Service Desk Lead', group: 'IT', color: '#199e70', initials: 'SW',
      bio: 'Service desk. Knows who got a new laptop and who forgot their password.'
    },
    {
      id: 'chidi', name: 'Chidi Eze', role: 'Network Engineer', group: 'IT', color: '#c98500', initials: 'CE',
      bio: 'Network team. Owns firewalls, VPN and the change calendar.'
    }
  ];
  g.SOC_TEAM = TEAM;
  g.SOC_SCENARIOS = g.SOC_SCENARIOS || [];
})(typeof window !== 'undefined' ? window : globalThis);
