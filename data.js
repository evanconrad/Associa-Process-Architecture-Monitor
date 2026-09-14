/* Seed state — Associa Process Architecture workflow monitor
   Structure mirrors the BA working session model:
   Value Stream -> Business Process -> Process Step -> Rubric Capability/Dimension -> Classification -> System Support */

const VALUE_STREAMS = [
  { id: 1, code: 'VS1', name: 'Community Acquisition & Lifecycle', scope: 'Acquire, contract, transition, configure, activate, and stabilize a community.', status: 'Working' },
  { id: 2, code: 'VS2', name: 'Community Governance & Administration', scope: 'Support boards and administer obligations, compliance, communications, records, and ownership changes.', status: 'Working' },
  { id: 3, code: 'VS3', name: 'Community Financial Management', scope: 'Plan, assess, bill, collect, apply, reconcile, report, and support financial decisions.', status: 'Working' },
  { id: 4, code: 'VS4', name: 'Resident Experience & Service', scope: 'Receive, route, resolve, communicate, close, and improve resident interactions.', status: 'Working' },
  { id: 5, code: 'VS5', name: 'Vendor & Property Operations', scope: 'Source, qualify, contract, schedule, perform, invoice, pay, and evaluate property work.', status: 'Working' },
  { id: 0, code: 'UNA', name: 'Unassigned', scope: 'Evidence that does not yet fit a working stream. Escalate — do not force-fit.', status: 'Unassigned' }
];

const STAGES = [
  { id: 1, name: 'Establish the Company Standard', short: 'Standard', color: '#2563eb',
    sub: 'Define a consistent operating baseline.',
    def: 'Understand current processes, procedures, systems, and operating expectations. Identify requirements that should be consistent across branches.',
    out: 'Company-standard baseline; consistent requirements; operating expectations' },
  { id: 2, name: 'Understand the Future State', short: 'Future state', color: '#7c3aed',
    sub: 'Design against future direction, not just current reality.',
    def: 'Identify upcoming company initiatives, process changes, system changes, Associa direction, and anticipated operating-model changes that affect onboarding.',
    out: 'Future-state assumptions; initiative impacts; design guardrails' },
  { id: 3, name: 'Establish the Documentation Approach', short: 'Documentation', color: '#16a34a',
    sub: 'Create a governed way to document, maintain, and share processes.',
    def: 'Establish a consistent format and detail level. Evaluate tools and repository; proposed approach is Visio or Lucidchart for maps and Confluence as the repository.',
    out: 'Documentation standard; templates; repository governance' },
  { id: 4, name: 'Leverage Existing Discovery', short: 'Discovery', color: '#0891b2',
    sub: 'Use existing branch evidence as the starting point.',
    def: 'Review gathered current-state information for processes, systems, roles, workflows, and branch-specific requirements. Identify clarification needs.',
    out: 'Evidence inventory; current-state workflow baseline; clarification backlog' },
  { id: 5, name: 'Assess & Identify Gaps', short: 'Gaps', color: '#e11d48',
    sub: 'Compare branch reality against standard and future direction.',
    def: 'Identify process, system, operational, and documentation gaps. Separate true gaps from legitimate branch-specific requirements.',
    out: 'Gap register; validated local requirements; annotated current-state maps' },
  { id: 6, name: 'Prioritize & Develop the Transition Plan', short: 'Transition plan', color: '#d97706',
    sub: 'Turn gaps into owned, sequenced change work.',
    def: 'Prioritize based on business impact, risk, complexity, timing, and future-state considerations. Establish target state, owners, dependencies, milestones, and dates.',
    out: 'Prioritized backlog; owners; dependencies; milestones; target state' },
  { id: 7, name: 'Validate Readiness', short: 'Readiness', color: '#1e3a8a',
    sub: 'Prove the target state works before onboarding completion.',
    def: 'Confirm required changes are implemented. Validate process, systems, roles, and documentation alignment. Resolve issues and obtain sign-off.',
    out: 'Readiness evidence; issue disposition; stakeholder sign-off' },
  { id: 8, name: 'Standardize & Improve', short: 'Standardize', color: '#0f766e',
    sub: 'Make the next onboarding wave better and more repeatable.',
    def: 'Capture lessons learned and recurring gaps. Refine documentation and templates, and develop a repeatable onboarding model for future branches.',
    out: 'Lessons learned; improved templates; repeatable onboarding model' }
];

const GAP_TYPES = ['Process', 'System', 'Operational', 'Documentation', 'Local requirement'];
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];

const BRANCHES = ['CMA', 'HER', 'GHE', 'CIMS', 'CAMS', 'SBB', 'SUD'];
const VARIANCE = ['', 'common', 'variant', 'unique', 'missing'];

const OWNERS = ['BA1 · Process synthesis', 'BA2 · Capability & systems', 'Paired review'];
const GAP_OWNERS = ['Heather Kerwin', 'Joy Wagner', 'BA1 · Process synthesis', 'BA2 · Capability & systems', 'TownSq Product', 'Community Management', 'Implementation'];
const EXECUTION = ['Automated', 'System-supported', 'Hybrid', 'Manual', 'Unknown'];

function P(o) {
  return Object.assign({
    trigger: '', outcome: '', roles: '', controls: '', exceptions: '', systems: '', notes: '',
    execution: 'Unknown', steps: [], evidence: [], rubric: { PC: 0, AC: 0, FB: 0, NA: 0 },
    branches: {}, systemsMapped: false, traceable: false, vsTag: 'Working', updated: '2026-09-02'
  }, o);
}

const PROCESSES = [
  P({ id: 'P-01', name: 'Invoice approval', vs: 3, l2: 'FinOps · Accounts Payable', capability: '6.1 Accounts Payable', domain: 'D6 Financial Operations', owner: OWNERS[0], stage: 5, pilot: true, traceable: true, systemsMapped: true, execution: 'Hybrid',
    trigger: 'Vendor invoice received via mail, email, or portal upload.',
    outcome: 'Approved invoice posted to the community ledger and queued for payment.',
    roles: 'Community manager · AP specialist · Board treasurer',
    controls: 'Board authority limits · dual approval above threshold · duplicate invoice check',
    exceptions: 'Missing PO, coding disputes, over-limit spend, vendor not set up',
    systems: 'Vantaca (branch) · TownSq (target) · M365 for exception routing',
    branches: { CMA: 'variant', HER: 'common', GHE: 'common', CIMS: 'common', CAMS: 'variant', SBB: 'common', SUD: '' },
    rubric: { PC: 4, AC: 3, FB: 1, NA: 0 },
    evidence: ['CMA1 transcript', 'HER1 transcript', 'CIMS1 questionnaire', 'AP procedure doc'],
    steps: [
      { n: 'Receive invoice', cap: 'Invoice intake', exec: 'System-supported' },
      { n: 'Code invoice', cap: 'Invoice coding', exec: 'Hybrid' },
      { n: 'Approve invoice', cap: 'Approval management', exec: 'Hybrid' },
      { n: 'Execute payment', cap: 'Payment management', exec: 'System-supported' },
      { n: 'Resolve exception', cap: 'Exception management', exec: 'Manual' }
    ] }),
  P({ id: 'P-02', name: 'Bank reconciliation', vs: 3, l2: 'FinOps · Banking', capability: '6.3 Banking', domain: 'D6 Financial Operations', owner: OWNERS[1], stage: 4, traceable: true,
    trigger: 'Month-end bank statement available.', outcome: 'Reconciled cash position signed off by accounting.',
    roles: 'Staff accountant · Controller', controls: 'Statement-to-ledger tie-out · unreconciled item aging',
    exceptions: 'Lockbox timing gaps, unidentified deposits', systems: 'Banking portal · Vantaca',
    branches: { CMA: 'common', HER: 'common', GHE: '', CIMS: 'variant', CAMS: 'common', SBB: 'common', SUD: '' },
    rubric: { PC: 2, AC: 1, FB: 2, NA: 0 },
    evidence: ['HER2 transcript', 'Banking rubric excerpt'],
    steps: [ { n: 'Import statement', cap: 'Bank feed', exec: 'System-supported' }, { n: 'Match transactions', cap: 'Reconciliation', exec: 'Hybrid' }, { n: 'Clear exceptions', cap: 'Exception management', exec: 'Manual' } ] }),
  P({ id: 'P-03', name: 'Special assessment', vs: 3, l2: 'FinOps · Assessments', capability: '6.5 Budgeting', domain: 'D6 Financial Operations', owner: OWNERS[0], stage: 2, vsTag: 'Working',
    trigger: 'Board approves a special assessment resolution.', outcome: 'Assessment billed, tracked, and collected across owners.',
    roles: 'Community manager · Board · AR specialist', controls: 'Board resolution on file · disclosure requirements',
    exceptions: 'Payment plans, partial payments, owner disputes', systems: 'TBD',
    branches: { CMA: 'variant', HER: 'variant', GHE: '', CIMS: 'common', CAMS: 'variant', SBB: '', SUD: '' },
    rubric: { PC: 1, AC: 1, FB: 3, NA: 0 },
    evidence: ['CMA4 transcript'],
    steps: [ { n: 'Record board resolution', cap: 'Governance records', exec: 'Manual' }, { n: 'Configure assessment', cap: 'Assessment setup', exec: 'Hybrid' } ] }),
  P({ id: 'P-04', name: 'Homeowner billing & statement run', vs: 3, l2: 'FinOps · Accounts Receivable', capability: '6.2 Accounts Receivable', domain: 'D6 Financial Operations', owner: OWNERS[1], stage: 3, traceable: true,
    trigger: 'Billing cycle opens for the community.', outcome: 'Statements delivered and receivables opened.',
    roles: 'AR specialist · Community manager', controls: 'Rate table approval · print/mail SLA',
    exceptions: 'Address changes, opt-out of paper, mid-cycle ownership change', systems: 'Vantaca · print vendor',
    branches: { CMA: 'common', HER: 'common', GHE: 'common', CIMS: 'common', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 3, AC: 4, FB: 1, NA: 1 }, evidence: ['CMA2 transcript', 'GHE1 transcript'],
    steps: [ { n: 'Generate charges', cap: 'Billing', exec: 'System-supported' }, { n: 'Deliver statements', cap: 'Owner communications', exec: 'System-supported' } ] }),
  P({ id: 'P-05', name: 'Delinquency escalation', vs: 3, l2: 'FinOps · Collections', capability: '6.6 Delinquency', domain: 'D6 Financial Operations', owner: OWNERS[0], stage: 3,
    trigger: 'Balance passes the delinquency threshold.', outcome: 'Account cured, on plan, or referred to counsel.',
    roles: 'Collections specialist · Manager · Attorney', controls: 'Board-approved collection policy · notice timing',
    exceptions: 'Bankruptcy, foreclosure, hardship plans', systems: 'Vantaca · attorney portal',
    branches: { CMA: 'variant', HER: 'variant', GHE: 'variant', CIMS: 'common', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 5, AC: 2, FB: 2, NA: 0 }, evidence: ['HER3 transcript', 'Collections policy PDF'],
    steps: [ { n: 'Identify delinquent accounts', cap: 'Delinquency monitoring', exec: 'System-supported' }, { n: 'Issue notices', cap: 'Owner communications', exec: 'Hybrid' }, { n: 'Refer to counsel', cap: 'Legal referral', exec: 'Manual' } ] }),
  P({ id: 'P-06', name: 'Annual budget preparation', vs: 3, l2: 'FinOps · Budgeting', capability: '6.5 Budgeting', domain: 'D6 Financial Operations', owner: OWNERS[1], stage: 2,
    trigger: 'Budget season calendar opens.', outcome: 'Board-adopted budget loaded for the next fiscal year.',
    roles: 'Community manager · Controller · Board', controls: 'Reserve study alignment · board adoption vote',
    exceptions: 'Late adoption, reserve funding shortfalls', systems: 'TBD',
    branches: { CMA: 'common', HER: '', GHE: 'variant', CIMS: '', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 2, AC: 2, FB: 1, NA: 0 }, evidence: ['GHE2 transcript'], steps: [] }),
  P({ id: 'P-07', name: 'Vendor setup & qualification', vs: 5, l2: 'Vendor Ops · Sourcing', capability: '7.1 Vendor Management', domain: 'D7 Vendor Operations', owner: OWNERS[1], stage: 5, traceable: true, systemsMapped: true, execution: 'Hybrid',
    trigger: 'New vendor requested by a community or manager.', outcome: 'Vendor approved, insured, and payable.',
    roles: 'Vendor coordinator · Risk · AP', controls: 'W-9 and COI verification · compliance expiry monitoring',
    exceptions: 'Expired insurance, single-source exceptions, emergency vendors', systems: 'Vantaca · compliance service',
    branches: { CMA: 'common', HER: 'common', GHE: 'common', CIMS: 'common', CAMS: 'common', SBB: 'variant', SUD: '' },
    rubric: { PC: 3, AC: 5, FB: 0, NA: 1 }, evidence: ['CMA1 transcript', 'CIMS2 transcript', 'Vendor checklist'],
    steps: [ { n: 'Collect vendor packet', cap: 'Vendor onboarding', exec: 'Hybrid' }, { n: 'Verify insurance', cap: 'Compliance', exec: 'System-supported' }, { n: 'Activate vendor record', cap: 'Vendor master', exec: 'System-supported' } ] }),
  P({ id: 'P-08', name: 'Work order lifecycle', vs: 5, l2: 'Vendor Ops · Maintenance', capability: '7.3 Work Orders', domain: 'D7 Vendor Operations', owner: OWNERS[0], stage: 4, traceable: true,
    trigger: 'Maintenance need reported or scheduled.', outcome: 'Work completed, verified, and invoiced.',
    roles: 'Maintenance coordinator · Vendor · Manager', controls: 'Spend authority · completion verification',
    exceptions: 'Emergency after-hours work, rework, warranty claims', systems: 'Vantaca · vendor mobile app',
    branches: { CMA: 'common', HER: 'variant', GHE: 'common', CIMS: 'common', CAMS: 'variant', SBB: '', SUD: '' },
    rubric: { PC: 4, AC: 3, FB: 2, NA: 0 }, evidence: ['CAMS1 transcript', 'GHE3 transcript'],
    steps: [ { n: 'Create work order', cap: 'Work order intake', exec: 'System-supported' }, { n: 'Dispatch vendor', cap: 'Scheduling', exec: 'Hybrid' }, { n: 'Verify completion', cap: 'Quality control', exec: 'Manual' } ] }),
  P({ id: 'P-09', name: 'Preventive maintenance scheduling', vs: 5, l2: 'Vendor Ops · Maintenance', capability: '7.4 Preventive Maintenance', domain: 'D7 Vendor Operations', owner: OWNERS[1], stage: 1,
    trigger: 'Asset calendar or inspection cycle due.', outcome: 'Scheduled service completed on cycle.',
    roles: 'Maintenance coordinator', controls: 'Asset register accuracy', exceptions: 'Seasonal deferrals', systems: 'TBD',
    branches: { CMA: '', HER: '', GHE: 'variant', CIMS: '', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 0, AC: 1, FB: 2, NA: 0 }, evidence: ['GHE4 transcript'], steps: [] }),
  P({ id: 'P-10', name: 'Resale & closing document fulfillment', vs: 2, l2: 'Governance · Ownership Change', capability: '4.6 Resale Processing', domain: 'D4 Homeowner Management', owner: OWNERS[0], stage: 5, traceable: true, systemsMapped: true, execution: 'System-supported',
    trigger: 'Title company or owner orders a resale package.', outcome: 'Statutory package delivered and ownership updated.',
    roles: 'Resale specialist · Community manager', controls: 'State disclosure timelines · fee schedule',
    exceptions: 'Rush orders, incomplete records, disputed balances', systems: 'Vantaca · third-party resale portal',
    branches: { CMA: 'common', HER: 'common', GHE: 'common', CIMS: 'common', CAMS: 'unique', SBB: 'common', SUD: '' },
    rubric: { PC: 2, AC: 4, FB: 1, NA: 0 }, evidence: ['CMA5 transcript', 'CAMS2 transcript', 'Resale SOP'],
    steps: [ { n: 'Receive order', cap: 'Order intake', exec: 'System-supported' }, { n: 'Assemble documents', cap: 'Document management', exec: 'Hybrid' }, { n: 'Deliver and update record', cap: 'Ownership records', exec: 'System-supported' } ] }),
  P({ id: 'P-11', name: 'Board meeting management', vs: 2, l2: 'Governance · Board Support', capability: '3.2 Board Governance', domain: 'D3 Community Governance', owner: OWNERS[1], stage: 3,
    trigger: 'Meeting calendar milestone reached.', outcome: 'Meeting held, minutes approved, actions tracked.',
    roles: 'Community manager · Board secretary', controls: 'Notice requirements · quorum · minute retention',
    exceptions: 'Executive sessions, emergency meetings', systems: 'TownSq · M365',
    branches: { CMA: 'common', HER: 'variant', GHE: 'common', CIMS: '', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 4, AC: 2, FB: 1, NA: 1 }, evidence: ['HER4 transcript'],
    steps: [ { n: 'Publish notice and packet', cap: 'Board communications', exec: 'Hybrid' }, { n: 'Record minutes', cap: 'Governance records', exec: 'Manual' } ] }),
  P({ id: 'P-12', name: 'Violation & compliance processing', vs: 2, l2: 'Governance · Compliance', capability: '3.5 Covenant Enforcement', domain: 'D3 Community Governance', owner: OWNERS[0], stage: 2,
    trigger: 'Inspection or resident report identifies a violation.', outcome: 'Violation cured or escalated per policy.',
    roles: 'Compliance inspector · Manager · Board', controls: 'Notice sequence · hearing rights · fine schedule',
    exceptions: 'Appeals, repeat offenders, legal escalation', systems: 'Vantaca mobile inspection',
    branches: { CMA: 'variant', HER: 'common', GHE: '', CIMS: 'variant', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 3, AC: 2, FB: 2, NA: 0 }, evidence: ['CIMS1 transcript'], steps: [] }),
  P({ id: 'P-13', name: 'Architectural review request', vs: 2, l2: 'Governance · ARC', capability: '3.6 Architectural Review', domain: 'D3 Community Governance', owner: OWNERS[1], stage: 1,
    trigger: 'Owner submits a modification request.', outcome: 'Request approved, denied, or conditioned on record.',
    roles: 'ARC committee · Manager', controls: 'Response deadlines · governing document alignment',
    exceptions: 'Incomplete submissions, after-the-fact work', systems: 'TBD',
    branches: { CMA: '', HER: '', GHE: '', CIMS: 'common', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 1, AC: 1, FB: 1, NA: 0 }, evidence: ['CIMS2 transcript'], steps: [] }),
  P({ id: 'P-14', name: 'Resident request intake & routing', vs: 4, l2: 'Resident · Service Desk', capability: '5.1 Service Requests', domain: 'D5 Resident Experience', owner: OWNERS[0], stage: 4, traceable: true,
    trigger: 'Resident contacts by phone, email, portal, or app.', outcome: 'Request resolved and closed with resident notified.',
    roles: 'Service desk · Community manager', controls: 'SLA timers · escalation matrix',
    exceptions: 'Emergencies, after-hours, multi-party disputes', systems: 'TownSq · call center platform',
    branches: { CMA: 'common', HER: 'common', GHE: 'variant', CIMS: 'common', CAMS: 'common', SBB: '', SUD: '' },
    rubric: { PC: 3, AC: 3, FB: 2, NA: 0 }, evidence: ['CAMS1 transcript', 'CMA3 transcript', 'Service desk report'],
    steps: [ { n: 'Capture request', cap: 'Request intake', exec: 'System-supported' }, { n: 'Route to owner', cap: 'Case routing', exec: 'Hybrid' }, { n: 'Close and notify', cap: 'Resident communications', exec: 'System-supported' } ] }),
  P({ id: 'P-15', name: 'Resident communications & notices', vs: 4, l2: 'Resident · Communications', capability: '5.4 Mass Communications', domain: 'D5 Resident Experience', owner: OWNERS[1], stage: 2,
    trigger: 'Community event, outage, or board notice.', outcome: 'Notice delivered across approved channels with proof.',
    roles: 'Community manager · Marketing', controls: 'Approval before send · delivery evidence retention',
    exceptions: 'Emergency blast, opt-out handling', systems: 'TownSq',
    branches: { CMA: 'common', HER: '', GHE: 'common', CIMS: '', CAMS: 'variant', SBB: '', SUD: '' },
    rubric: { PC: 2, AC: 3, FB: 1, NA: 0 }, evidence: ['CMA6 transcript'], steps: [] }),
  P({ id: 'P-16', name: 'Branch onboarding & configuration', vs: 1, l2: 'Acquisition · Implementation', capability: '9.2 Branch Setup', domain: 'D9 Implementation & Transition', owner: OWNERS[2], stage: 3, traceable: true,
    trigger: 'Conversion project approved and scheduled.', outcome: 'Branch live on Associa standard configuration.',
    roles: 'Implementation lead · Ops · BA team', controls: 'Readiness gate sign-off · data validation',
    exceptions: 'Legacy data gaps, custom workflows without a standard', systems: 'TownSq · migration tooling',
    branches: { CMA: 'common', HER: 'common', GHE: '', CIMS: '', CAMS: '', SBB: '', SUD: '' },
    rubric: { PC: 4, AC: 6, FB: 2, NA: 1 }, evidence: ['Implementation rubric D9', 'CMA1 transcript'],
    steps: [ { n: 'Confirm scope and readiness', cap: 'Readiness assessment', exec: 'Manual' }, { n: 'Configure platform', cap: 'Configuration', exec: 'Hybrid' }, { n: 'Validate and cut over', cap: 'Migration', exec: 'Hybrid' } ] }),
  P({ id: 'P-17', name: 'Community data migration', vs: 1, l2: 'Acquisition · Data', capability: '9.4 Data Migration', domain: 'D9 Implementation & Transition', owner: OWNERS[1], stage: 2,
    trigger: 'Conversion cutover window opens.', outcome: 'Balances, owners, and documents verified in target system.',
    roles: 'Data lead · Accounting · BA team', controls: 'Balance tie-out · exception log sign-off',
    exceptions: 'Unmapped legacy fields, open items at cutover', systems: 'Legacy system · TownSq',
    branches: { CMA: '', HER: 'variant', GHE: '', CIMS: '', CAMS: '', SBB: 'common', SUD: '' },
    rubric: { PC: 1, AC: 3, FB: 3, NA: 0 }, evidence: ['SBB1 transcript'], steps: [] }),
  P({ id: 'P-18', name: 'Go-live stabilization & hypercare', vs: 1, l2: 'Acquisition · Stabilization', capability: '9.6 Stabilization', domain: 'D9 Implementation & Transition', owner: OWNERS[0], stage: 1,
    trigger: 'Branch goes live on the Associa platform.', outcome: 'Issues burned down and branch handed to steady state.',
    roles: 'Implementation · Ops · Support', controls: 'Issue aging · exit criteria',
    exceptions: 'Escalated resident impact, payroll or payment failures', systems: 'TBD',
    branches: {}, rubric: { PC: 0, AC: 1, FB: 1, NA: 0 }, evidence: [], steps: [] }),
  P({ id: 'P-19', name: 'After-hours emergency handling', vs: 0, l2: 'Unassigned', capability: 'Unmapped', domain: 'Unmapped', owner: OWNERS[0], stage: 1, vsTag: 'Unassigned',
    trigger: 'Emergency call received outside business hours.', outcome: 'Emergency triaged and dispatched.',
    roles: 'Answering service · On-call manager', controls: 'Escalation tree', exceptions: 'Life-safety events', systems: 'Answering service',
    notes: 'Evidence spans Resident Experience and Vendor Operations — candidate for a stream boundary change. Escalated to Heather / Joy.',
    branches: { CMA: 'variant', HER: '', GHE: 'variant', CIMS: '', CAMS: 'unique', SBB: '', SUD: '' },
    rubric: { PC: 1, AC: 0, FB: 2, NA: 0 }, evidence: ['CAMS2 transcript', 'GHE3 transcript'], steps: [] })
];

const SESSIONS = [
  { date: '2026-08-10', code: 'CMA1', branch: 'CMA', status: 'Analyzed', flagged: false },
  { date: '2026-08-17', code: 'HER1', branch: 'HER', status: 'Analyzed', flagged: false },
  { date: '2026-08-17', code: 'HER2', branch: 'HER', status: 'Analyzed', flagged: false },
  { date: '2026-08-17', code: 'GHE1', branch: 'GHE', status: 'Transcript received', flagged: false },
  { date: '2026-08-17', code: 'CMA2', branch: 'CMA', status: 'Analyzed', flagged: false },
  { date: '2026-08-17', code: 'CMA3', branch: 'CMA', status: 'Transcript received', flagged: false },
  { date: '2026-08-24', code: 'HER3', branch: 'HER', status: 'Analyzed', flagged: false },
  { date: '2026-08-24', code: 'HER4', branch: 'HER', status: 'Transcript received', flagged: false },
  { date: '2026-08-24', code: 'GHE2', branch: 'GHE', status: 'Transcript received', flagged: false },
  { date: '2026-08-24', code: 'CMA4', branch: 'CMA', status: 'Transcript received', flagged: false },
  { date: '2026-08-24', code: 'CMA5', branch: 'CMA', status: 'Analyzed', flagged: false },
  { date: '2026-08-31', code: 'HER5', branch: 'HER', status: 'Awaiting transcript', flagged: false },
  { date: '2026-08-31', code: 'GHE3', branch: 'GHE', status: 'Transcript received', flagged: false },
  { date: '2026-08-31', code: 'GHE4', branch: 'GHE', status: 'Awaiting transcript', flagged: false },
  { date: '2026-08-31', code: 'CMA6', branch: 'CMA', status: 'Transcript received', flagged: true },
  { date: '2026-08-31', code: 'CIMS1', branch: 'CIMS', status: 'Transcript received', flagged: false },
  { date: '2026-08-31', code: 'CIMS2', branch: 'CIMS', status: 'Awaiting transcript', flagged: false },
  { date: '2026-08-31', code: 'CAMS1', branch: 'CAMS', status: 'Transcript received', flagged: false },
  { date: '2026-08-31', code: 'CAMS2', branch: 'CAMS', status: 'Awaiting transcript', flagged: false },
  { date: '2026-09-07', code: 'HER6', branch: 'HER', status: 'Scheduled', flagged: true },
  { date: '2026-09-07', code: 'CIMS3', branch: 'CIMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-07', code: 'CIMS4', branch: 'CIMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-07', code: 'CAMS3', branch: 'CAMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-07', code: 'CAMS4', branch: 'CAMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-07', code: 'GHE5', branch: 'GHE', status: 'Scheduled', flagged: false },
  { date: '2026-09-07', code: 'GHE6', branch: 'GHE', status: 'Scheduled', flagged: true },
  { date: '2026-09-14', code: 'CAMS5', branch: 'CAMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-14', code: 'CAMS6', branch: 'CAMS', status: 'Scheduled', flagged: true },
  { date: '2026-09-14', code: 'SUD1', branch: 'SUD', status: 'Scheduled', flagged: false },
  { date: '2026-09-14', code: 'CIMS5', branch: 'CIMS', status: 'Scheduled', flagged: false },
  { date: '2026-09-14', code: 'CIMS6', branch: 'CIMS', status: 'Scheduled', flagged: true },
  { date: '2026-09-14', code: 'SBB1', branch: 'SBB', status: 'Scheduled', flagged: false },
  { date: '2026-09-14', code: 'SBB2', branch: 'SBB', status: 'Scheduled', flagged: false },
  { date: '2026-09-21', code: 'SBB3', branch: 'SBB', status: 'Scheduled', flagged: false },
  { date: '2026-09-21', code: 'SBB4', branch: 'SBB', status: 'Scheduled', flagged: false },
  { date: '2026-09-21', code: 'SUD2', branch: 'SUD', status: 'Scheduled', flagged: false },
  { date: '2026-09-21', code: 'SUD3', branch: 'SUD', status: 'Scheduled', flagged: false },
  { date: '2026-09-28', code: 'SUD4', branch: 'SUD', status: 'Scheduled', flagged: false },
  { date: '2026-09-28', code: 'SUD5', branch: 'SUD', status: 'Scheduled', flagged: false },
  { date: '2026-09-28', code: 'SUD6', branch: 'SUD', status: 'Scheduled', flagged: true }
];

const SESSION_STATUS = ['Scheduled', 'Awaiting transcript', 'Transcript received', 'Analyzed'];

const DECISIONS = [
  { id: 'D-01', title: 'Confirm the working architecture hierarchy', detail: 'Value stream → process → step → capability / dimension → classification → system → adoption.', owner: 'Joy Wagner', type: 'Framework', due: '2026-09-08', status: 'Open' },
  { id: 'D-02', title: 'Set level of detail for the process library', detail: 'How deep do we map? Capture the differences that make a difference — not every step.', owner: 'Heather Kerwin', type: 'Scope', due: '2026-09-08', status: 'Open' },
  { id: 'D-03', title: 'Validate the five working value streams', detail: 'Are they correct, complete, and bounded well enough for process ownership?', owner: 'Joy Wagner', type: 'Taxonomy', due: '2026-09-15', status: 'Open' },
  { id: 'D-04', title: 'Select the FinOps pilot process', detail: 'Invoice approval proposed — represented across the first transcript set.', owner: 'BA team', type: 'Pilot', due: '2026-09-08', status: 'Resolved' },
  { id: 'D-05', title: 'Approve the two standard templates', detail: 'Branch comparison matrix and process-step support matrix.', owner: 'Heather Kerwin', type: 'Artifact', due: '2026-09-10', status: 'Open' },
  { id: 'D-06', title: 'Establish review cadence', detail: 'Paired BA review, then SME / process-owner validation.', owner: 'BA team', type: 'Governance', due: '2026-09-10', status: 'Resolved' },
  { id: 'D-07', title: 'Resolve after-hours emergency stream placement', detail: 'Evidence spans Resident Experience and Vendor Operations — possible missing stream.', owner: 'Joy Wagner', type: 'Taxonomy', due: '2026-09-18', status: 'Open' },
  { id: 'D-08', title: 'Confirm special assessment standard', detail: 'Variant in four branches, unique at CMC — requires a standard decision.', owner: 'Heather Kerwin', type: 'Standard', due: '2026-09-22', status: 'Open' }
];

const RUBRIC_DOMAINS = [
  { code: 'D1', name: 'Platform Foundation', dims: 13 },
  { code: 'D3', name: 'Community Governance', dims: 18 },
  { code: 'D4', name: 'Homeowner Management', dims: 20 },
  { code: 'D5', name: 'Resident Experience', dims: 15 },
  { code: 'D6', name: 'Financial Operations', dims: 53 },
  { code: 'D7', name: 'Vendor Operations', dims: 21 },
  { code: 'D9', name: 'Implementation & Transition', dims: 6 }
];


/* ---- Atlas alignment: stage placement and gap register (stages 1-8) ---- */
const STAGE_MAP = {
  'P-01': 7, 'P-02': 6, 'P-03': 5, 'P-04': 6, 'P-05': 5, 'P-06': 4, 'P-07': 8,
  'P-08': 6, 'P-09': 4, 'P-10': 7, 'P-11': 5, 'P-12': 5, 'P-13': 4, 'P-14': 6,
  'P-15': 4, 'P-16': 3, 'P-17': 4, 'P-18': 2, 'P-19': 4
};

const GAPS = {
  'P-01': [
    { what: 'Approval thresholds differ by branch with no company standard', type: 'Process', impact: 'High', priority: 'P0', owner: 'Heather Kerwin', target: '2026-09-30' },
    { what: 'Exception routing handled by email rather than a tracked queue', type: 'System', impact: 'Medium', priority: 'P1', owner: 'BA2 · Capability & systems', target: '2026-10-15' }
  ],
  'P-02': [
    { what: 'No standard unreconciled-item aging report', type: 'System', impact: 'Medium', priority: 'P1', owner: 'BA2 · Capability & systems', target: '2026-10-31' },
    { what: 'Lockbox timing gap undocumented at CIMS', type: 'Documentation', impact: 'Low', priority: 'P3', owner: '', target: '' }
  ],
  'P-03': [
    { what: 'Special assessment configuration unique at CMC — no company standard', type: 'Process', impact: 'High', priority: 'P0', owner: 'Heather Kerwin', target: '2026-09-30' },
    { what: 'Payment plan handling not supported in target platform', type: 'System', impact: 'High', priority: 'P1', owner: 'TownSq Product', target: '2026-11-30' },
    { what: 'Board resolution retention step missing from maps', type: 'Documentation', impact: 'Low', priority: 'P2', owner: '', target: '' }
  ],
  'P-04': [
    { what: 'Mid-cycle ownership change handled manually', type: 'Operational', impact: 'Medium', priority: 'P2', owner: 'BA1 · Process synthesis', target: '2026-10-31' }
  ],
  'P-05': [
    { what: 'Collection notice timing varies by state and branch', type: 'Local requirement', impact: 'Medium', priority: 'P2', owner: 'BA1 · Process synthesis', target: '2026-10-15' },
    { what: 'Attorney referral handoff has no system record', type: 'System', impact: 'High', priority: 'P1', owner: 'TownSq Product', target: '2026-11-15' }
  ],
  'P-06': [
    { what: 'Reserve study inputs not linked to the budget cycle', type: 'Process', impact: 'Medium', priority: 'P2', owner: '', target: '' }
  ],
  'P-08': [
    { what: 'Emergency after-hours dispatch bypasses the work order record', type: 'Operational', impact: 'High', priority: 'P0', owner: 'Joy Wagner', target: '2026-09-30' },
    { what: 'Completion verification evidence not captured consistently', type: 'Documentation', impact: 'Medium', priority: 'P2', owner: 'BA1 · Process synthesis', target: '2026-10-31' }
  ],
  'P-09': [
    { what: 'No asset register at five of seven branch groups', type: 'Operational', impact: 'High', priority: 'P1', owner: '', target: '' }
  ],
  'P-10': [
    { what: 'Rush order SLA undefined in the company standard', type: 'Process', impact: 'Medium', priority: 'P2', owner: 'Heather Kerwin', target: '2026-10-15' }
  ],
  'P-11': [
    { what: 'Minute retention location varies; no governed repository', type: 'Documentation', impact: 'Medium', priority: 'P1', owner: 'BA2 · Capability & systems', target: '2026-10-15' }
  ],
  'P-12': [
    { what: 'Fine schedule differences are legitimate and state-driven', type: 'Local requirement', impact: 'Low', priority: 'P3', owner: 'BA1 · Process synthesis', target: '' },
    { what: 'Appeal workflow undocumented', type: 'Documentation', impact: 'Medium', priority: 'P2', owner: '', target: '' }
  ],
  'P-13': [
    { what: 'Response deadline tracking absent from target platform', type: 'System', impact: 'Medium', priority: 'P2', owner: 'TownSq Product', target: '2026-12-15' }
  ],
  'P-14': [
    { what: 'SLA definitions differ across branch service desks', type: 'Process', impact: 'High', priority: 'P1', owner: 'Heather Kerwin', target: '2026-10-15' }
  ],
  'P-15': [
    { what: 'Delivery-proof retention not standardized', type: 'Documentation', impact: 'Low', priority: 'P3', owner: '', target: '' }
  ],
  'P-16': [
    { what: 'Readiness exit criteria not yet defined for onboarding waves', type: 'Process', impact: 'High', priority: 'P0', owner: 'Joy Wagner', target: '2026-09-22' },
    { what: 'Documentation approach not finalized (Visio/Lucid + Confluence proposed)', type: 'Documentation', impact: 'High', priority: 'P0', owner: 'Heather Kerwin', target: '2026-09-15' }
  ],
  'P-17': [
    { what: 'Unmapped legacy fields at SBB have no target-state destination', type: 'System', impact: 'High', priority: 'P1', owner: 'BA2 · Capability & systems', target: '2026-10-31' }
  ],
  'P-18': [
    { what: 'Hypercare exit criteria and issue aging thresholds undefined', type: 'Operational', impact: 'Medium', priority: 'P1', owner: '', target: '' }
  ],
  'P-19': [
    { what: 'Emergency handling spans two value streams — ownership unclear', type: 'Process', impact: 'High', priority: 'P0', owner: 'Joy Wagner', target: '2026-09-18' }
  ]
};

PROCESSES.forEach(p => { p.stage = STAGE_MAP[p.id] || 4; p.gaps = GAPS[p.id] || []; });
