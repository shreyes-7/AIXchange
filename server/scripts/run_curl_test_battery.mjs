import { execSync } from 'child_process';
import mongoose from 'mongoose';

const BASE_URL = 'http://localhost:5000/api/v1';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aixchange';

// Helper to run curl command
function runCurl({ method = 'GET', path, headers = {}, body = null, desc = '' }) {
  let headerFlags = Object.entries(headers)
    .map(([k, v]) => `-H "${k}: ${v}"`)
    .join(' ');
  
  let dataFlag = '';
  let input = undefined;
  if (body !== null && body !== undefined) {
    dataFlag = `-d @-`;
    input = JSON.stringify(body);
  }

  // Use curl with write-out for status code
  const cmd = `curl.exe -s -X ${method} "${BASE_URL}${path}" ${headerFlags} ${dataFlag} -w "\\n%{http_code}"`;
  
  try {
    const rawOutput = execSync(cmd, { encoding: 'utf8', timeout: 15000, input }).trim();
    const lines = rawOutput.split('\n');
    const statusCode = parseInt(lines[lines.length - 1], 10);
    const responseBody = lines.slice(0, -1).join('\n');
    let parsedBody = null;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }
    return { statusCode, body: parsedBody, raw: responseBody };
  } catch (err) {
    return { statusCode: 0, error: err.message };
  }
}

async function main() {
  console.log('========================================================================');
  console.log('AIXchange Phase 12 Live curl.exe Comprehensive API Test Battery');
  console.log('Testing: Positive, Negative, and Edge Cases on Live Backend (Port 5000)');
  console.log('========================================================================\n');

  await mongoose.connect(MONGODB_URI);
  const User = mongoose.model(
    'User',
    new mongoose.Schema({}, { strict: false }),
    'users'
  );
  const Dataset = mongoose.model(
    'Dataset',
    new mongoose.Schema({}, { strict: false }),
    'datasets'
  );
  const Model = mongoose.model(
    'Model',
    new mongoose.Schema({}, { strict: false }),
    'models'
  );

  const timestamp = Date.now();
  const testPassword = 'Password123!';

  // 1. Ensure test users exist in DB
  const adminEmail = `admin_curl_${timestamp}@example.com`;
  const userEmail = `user_curl_${timestamp}@example.com`;
  const victimEmail = `victim_curl_${timestamp}@example.com`;

  console.log('--- Step 0: Setup Seed Users and Datasets via Live Endpoints ---');

  runCurl({
    method: 'POST',
    path: '/auth/register',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: `User Curl ${timestamp}`,
      email: userEmail,
      password: testPassword
    }
  });

  runCurl({
    method: 'POST',
    path: '/auth/register',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: `Victim Curl ${timestamp}`,
      email: victimEmail,
      password: testPassword
    }
  });

  runCurl({
    method: 'POST',
    path: '/auth/register',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: `Admin Curl ${timestamp}`,
      email: adminEmail,
      password: testPassword
    }
  });

  // Promote admin in database directly
  await User.updateOne({ email: adminEmail }, { $set: { role: 'ADMIN' } });

  // Get user documents to have their real MongoDB _ids
  const adminDoc = await User.findOne({ email: adminEmail });
  const userDoc = await User.findOne({ email: userEmail });
  const victimDoc = await User.findOne({ email: victimEmail });

  // Create a dataset fixture for moderation and reporting
  const testDataset = await Dataset.create({
    title: `Curl Test Dataset ${timestamp}`,
    description: 'Dataset created for live curl verification of Phase 12 moderation.',
    owner: userDoc._id,
    creatorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    price: '100',
    tags: ['ai', 'curl', 'moderation'],
    status: 'active'
  });

  // Create a model fixture for model moderation
  const testModel = await Model.create({
    name: `Curl-Test-Model-${timestamp}`,
    description: 'Model created for live curl verification of Phase 12 moderation.',
    owner: userDoc._id,
    developerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    task: 'text-generation',
    framework: 'PyTorch',
    status: 'active',
    active: true
  });

  // Login to acquire JWTs
  const loginUser = runCurl({
    method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: { email: userEmail, password: testPassword }
  });
  const userToken = loginUser.body?.data?.accessToken;

  const loginAdmin = runCurl({
    method: 'POST',
    path: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: { email: adminEmail, password: testPassword }
  });
  const adminToken = loginAdmin.body?.data?.accessToken;

  console.log(`Regular User Token Acquired: ${Boolean(userToken)}`);
  console.log(`Admin User Token Acquired:    ${Boolean(adminToken)}`);
  console.log(`Target Dataset ID:            ${testDataset._id}`);
  console.log(`Target Model ID:              ${testModel._id}\n`);

  const results = [];
  let reportIdCreated = null;
  const testFlagId = `FLAG_CURL_${timestamp}`;

  function recordTest(category, desc, expectedCode, actualCode, extraCondition = true, details = '') {
    const pass = (actualCode === expectedCode) && extraCondition;
    results.push({ category, desc, expectedCode, actualCode, pass, details });
    const mark = pass ? '✓ PASS' : '✗ FAIL';
    console.log(`[${mark}] [${category.padEnd(8)}] ${desc} (Expected: ${expectedCode}, Got: ${actualCode})`);
    if (!pass && details) {
      console.log(`       Details: ${details}`);
    }
  }

  console.log('========================================================================');
  console.log('SECTION 1: POSITIVE TESTS (HAPPY PATH WORKFLOWS)');
  console.log('========================================================================');

  // P1: User profile me (GET /auth/profile)
  {
    const res = runCurl({
      method: 'GET',
      path: '/auth/profile',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    recordTest('POSITIVE', 'GET /auth/profile - Authenticated user fetches profile', 200, res.statusCode, res.body?.success === true);
  }

  // P2: User submits report on dataset
  {
    const res = runCurl({
      method: 'POST',
      path: '/reports',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        targetType: 'DATASET',
        targetId: testDataset._id.toString(),
        category: 'SPAM',
        description: 'Dataset contains unsolicited spam keywords.',
        priority: 'MEDIUM'
      }
    });
    reportIdCreated = res.body?.data?._id;
    recordTest('POSITIVE', 'POST /reports - User submits valid report on dataset', 201, res.statusCode, Boolean(reportIdCreated));
  }

  // P3: User submits report on user
  {
    const res = runCurl({
      method: 'POST',
      path: '/reports',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        targetType: 'USER',
        targetId: victimDoc._id.toString(),
        category: 'POLICY_VIOLATION',
        description: 'User violates platform terms of service.'
      }
    });
    recordTest('POSITIVE', 'POST /reports - User submits valid report on user target', 201, res.statusCode, res.body?.success === true);
  }

  // P4: Admin lists users
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users?limit=10&page=1',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('POSITIVE', 'GET /admin/users - Admin lists paginated users', 200, res.statusCode, Array.isArray(res.body?.data?.users));
  }

  // P5: Admin views single user details
  {
    const res = runCurl({
      method: 'GET',
      path: `/admin/users/${victimDoc._id}`,
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('POSITIVE', 'GET /admin/users/:userId - Admin views single user details and counts', 200, res.statusCode, res.body?.data?._id === victimDoc._id.toString());
  }

  // P6: Admin lists reports queue
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/reports?status=OPEN&targetType=DATASET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('POSITIVE', 'GET /admin/reports - Admin lists filtered reports queue', 200, res.statusCode, Array.isArray(res.body?.data?.reports));
  }

  // P7: Admin views report details
  {
    const res = runCurl({
      method: 'GET',
      path: `/admin/reports/${reportIdCreated}`,
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('POSITIVE', 'GET /admin/reports/:reportId - Admin views report with populated target entity', 200, res.statusCode, res.body?.data?._id === reportIdCreated);
  }

  // P8: Admin assigns report to admin
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/reports/${reportIdCreated}/assignment`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        adminId: adminDoc._id.toString()
      }
    });
    const assignedId = res.body?.data?.assignedAdminId?._id || res.body?.data?.assignedAdminId;
    recordTest('POSITIVE', 'PATCH /admin/reports/:reportId/assignment - Admin assigns report', 200, res.statusCode, String(assignedId) === String(adminDoc._id));
  }

  // P9: Admin resolves report
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/reports/${reportIdCreated}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'RESOLVED',
        resolution: 'Action confirmed. Content reviewed and appropriate measures taken.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/reports/:reportId/status - Admin resolves report with note', 200, res.statusCode, res.body?.data?.status === 'RESOLVED');
  }

  // P10: Admin moderates dataset status
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/datasets/${testDataset._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'hidden',
        reason: 'Hiding dataset pending copyright verification.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/datasets/:datasetId/status - Admin sets dataset to hidden', 200, res.statusCode, res.body?.data?.status === 'hidden');
  }

  // P11: Admin moderates model status with active sync
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/models/${testModel._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'under_review',
        reason: 'Reviewing model weights hash consistency.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/models/:modelId/status - Admin moderates model, syncing active=false', 200, res.statusCode, res.body?.data?.status === 'under_review' && res.body?.data?.active === false);
  }

  // P12: Admin ingests blockchain fraud flags
  {
    const res = runCurl({
      method: 'POST',
      path: '/admin/fraud-flags/ingest',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        flags: [
          {
            flagId: testFlagId,
            ruleId: 'RAPID_TRANSACTIONS',
            severity: 'HIGH',
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            targetAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            description: 'Rapid transaction burst detected on-chain',
            evidence: { txCount: 15, windowSeconds: 30 },
            recommendedAction: 'INVESTIGATE_AND_MONITOR'
          }
        ]
      }
    });
    recordTest('POSITIVE', 'POST /admin/fraud-flags/ingest - Ingest structured blockchain fraud flags', 201, res.statusCode, Array.isArray(res.body?.data) && res.body?.data?.length >= 1);
  }

  // P13: Admin reviews fraud flag
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/fraud-flags/${testFlagId}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'CONFIRMED',
        reviewNotes: 'Flag verified against on-chain transaction rate anomaly.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/fraud-flags/:id/status - Review fraud flag (CONFIRMED)', 200, res.statusCode, res.body?.data?.status === 'CONFIRMED');
  }

  // P14: Admin suspends user
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/users/${victimDoc._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'SUSPENDED',
        reason: 'Violating community guidelines and terms of service.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/users/:userId/status - Admin suspends user account', 200, res.statusCode, res.body?.data?.status === 'SUSPENDED');
  }

  // P15: Admin queries append-only moderation audit trail
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/audits?limit=50',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const audits = res.body?.data?.audits || [];
    const actionsFound = new Set(audits.map(a => a.action));
    const hasRequiredAudits = actionsFound.has('USER_SUSPEND') &&
                              (actionsFound.has('DATASET_HIDE') || actionsFound.has('DATASET_STATUS_CHANGE')) &&
                              (actionsFound.has('MODEL_HIDE') || actionsFound.has('MODEL_STATUS_CHANGE')) &&
                              (actionsFound.has('REPORT_RESOLVE') || actionsFound.has('REPORT_STATUS_CHANGE'));
    recordTest('POSITIVE', 'GET /admin/audits - Query append-only audit trail capturing all actions', 200, res.statusCode, hasRequiredAudits);
  }

  // P16: Admin queries authoritative treasury telemetry
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/treasury',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('POSITIVE', 'GET /admin/treasury - Consumes authoritative on-chain treasury state', 200, res.statusCode, res.body?.data?.treasuryAddress !== undefined);
  }

  // P17: Admin restores suspended user
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/users/${victimDoc._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'ACTIVE',
        reason: 'Appeal approved; restored account.'
      }
    });
    recordTest('POSITIVE', 'PATCH /admin/users/:userId/status - Admin restores user to ACTIVE', 200, res.statusCode, res.body?.data?.status === 'ACTIVE');
  }

  console.log('\n========================================================================');
  console.log('SECTION 2: NEGATIVE TESTS (ERROR PATHS & ACCESS CONTROLS)');
  console.log('========================================================================');

  // N1: Unauthenticated access to admin endpoint
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users'
    });
    recordTest('NEGATIVE', 'GET /admin/users without token returns 401 Unauthorized', 401, res.statusCode);
  }

  // N2: Tampered/invalid token
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users',
      headers: { 'Authorization': 'Bearer invalid.tampered.token' }
    });
    recordTest('NEGATIVE', 'GET /admin/users with invalid JWT returns 401 Unauthorized', 401, res.statusCode);
  }

  // N3: Non-admin user access to admin endpoint
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    recordTest('NEGATIVE', 'GET /admin/users with regular USER role returns 403 Forbidden', 403, res.statusCode);
  }

  // N4: Non-admin user access to fraud flag ingestion
  {
    const res = runCurl({
      method: 'POST',
      path: '/admin/fraud-flags/ingest',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: { flags: [] }
    });
    recordTest('NEGATIVE', 'POST /admin/fraud-flags/ingest with non-admin returns 403 Forbidden', 403, res.statusCode);
  }

  // N5: Admin self-suspension protection
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/users/${adminDoc._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'SUSPENDED',
        reason: 'Attempting self-suspension'
      }
    });
    recordTest('NEGATIVE', 'PATCH /admin/users/:adminId/status - Self-suspension rejected with 403 Forbidden', 403, res.statusCode, res.body?.message?.includes('own'));
  }

  // N6: Report target does not exist
  {
    const nonExistentId = '507f1f77bcf86cd799439011';
    const res = runCurl({
      method: 'POST',
      path: '/reports',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        targetType: 'DATASET',
        targetId: nonExistentId,
        category: 'SPAM',
        description: 'Report against non-existent target'
      }
    });
    recordTest('NEGATIVE', 'POST /reports with non-existent targetId returns 400 Bad Request', 400, res.statusCode);
  }

  // N7: Report invalid category
  {
    const res = runCurl({
      method: 'POST',
      path: '/reports',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        targetType: 'DATASET',
        targetId: testDataset._id.toString(),
        category: 'INVALID_CATEGORY_XYZ',
        description: 'Testing invalid category'
      }
    });
    recordTest('NEGATIVE', 'POST /reports with invalid category enum returns 400 Bad Request', 400, res.statusCode);
  }

  // N8: Suspend user and verify access blocked
  {
    // Suspend victim user
    await User.updateOne({ _id: victimDoc._id }, { $set: { status: 'SUSPENDED' } });
    
    // Login as victim to get token
    const victimLogin = runCurl({
      method: 'POST',
      path: '/auth/login',
      headers: { 'Content-Type': 'application/json' },
      body: { email: victimEmail, password: testPassword }
    });
    recordTest('NEGATIVE', 'POST /auth/login for SUSPENDED user rejected with 403 Forbidden', 403, victimLogin.statusCode);

    // Call authenticated endpoint with token of suspended account
    await User.updateOne({ _id: userDoc._id }, { $set: { status: 'SUSPENDED' } });
    const blockedRes = runCurl({
      method: 'GET',
      path: '/auth/profile',
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    recordTest('NEGATIVE', 'GET /auth/profile with SUSPENDED account token rejected with 403 Forbidden', 403, blockedRes.statusCode);

    // Re-activate userDoc for clean state
    await User.updateOne({ _id: userDoc._id }, { $set: { status: 'ACTIVE' } });
    await User.updateOne({ _id: victimDoc._id }, { $set: { status: 'ACTIVE' } });
  }

  console.log('\n========================================================================');
  console.log('SECTION 3: EDGE CASES & ROBUSTNESS TESTS');
  console.log('========================================================================');

  // E1: Empty JSON body on report submission
  {
    const res = runCurl({
      method: 'POST',
      path: '/reports',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: {}
    });
    recordTest('EDGE', 'POST /reports with empty body returns 400 Bad Request', 400, res.statusCode);
  }

  // E2: Malformed MongoDB ObjectId string
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users/not-a-valid-object-id',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('EDGE', 'GET /admin/users/:userId with malformed ID returns 400 Bad Request', 400, res.statusCode);
  }

  // E3: Valid ObjectId format but non-existent user
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/users/507f1f77bcf86cd799439011',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('EDGE', 'GET /admin/users/:userId with non-existent ObjectId returns 404 Not Found', 404, res.statusCode);
  }

  // E4: Unknown model status transition
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/models/${testModel._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'DISCARDED_STATUS',
        reason: 'Testing unknown status string'
      }
    });
    recordTest('EDGE', 'PATCH /admin/models/:id/status with non-enum status returns 400 Bad Request', 400, res.statusCode);
  }

  // E5: Missing reason string in moderation action
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/datasets/${testDataset._id}/status`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        status: 'hidden'
        // missing reason
      }
    });
    recordTest('EDGE', 'PATCH /admin/datasets/:id/status missing required reason returns 400 Bad Request', 400, res.statusCode);
  }

  // E6: Ingest empty flags array
  {
    const res = runCurl({
      method: 'POST',
      path: '/admin/fraud-flags/ingest',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        flags: []
      }
    });
    recordTest('EDGE', 'POST /admin/fraud-flags/ingest with empty array returns 400 Bad Request', 400, res.statusCode);
  }

  // E7: Audit log query with invalid targetType
  {
    const res = runCurl({
      method: 'GET',
      path: '/admin/audits?targetType=NON_EXISTENT_TYPE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    recordTest('EDGE', 'GET /admin/audits with invalid targetType returns 400 Bad Request', 400, res.statusCode);
  }

  // E8: Assign report to non-existent admin ID
  {
    const res = runCurl({
      method: 'PATCH',
      path: `/admin/reports/${reportIdCreated}/assignment`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        adminId: '507f1f77bcf86cd799439011'
      }
    });
    recordTest('EDGE', 'PATCH /admin/reports/:id/assignment with non-admin returns 400 Bad Request', 400, res.statusCode);
  }

  await mongoose.disconnect();

  console.log('\n========================================================================');
  console.log('LIVE CURL TEST BATTERY SUMMARY REPORT');
  console.log('========================================================================');
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;

  console.log(`Total live curl tests executed: ${total}`);
  console.log(`Passed:                          ${passed}`);
  console.log(`Failed:                          ${failed}`);
  console.log(`Success Rate:                    ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.error('Some tests failed!');
    process.exit(1);
  } else {
    console.log('ALL LIVE CURL POSITIVE, NEGATIVE, AND EDGE CASE TESTS PASSED PERFECTLY!');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error in curl test battery:', err);
  process.exit(1);
});
