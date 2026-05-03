*** Settings ***
Resource          ../resources/keywords.robot
Suite Setup       Initialize API Session

*** Test Cases ***
Check API Root Endpoint Is Reachable
    ${response}=    Get Request To API Endpoint    /
    Should Be Equal As Numbers    ${response.status_code}    200

Check Transactions Endpoint
    ${response}=    Get Request To API Endpoint    /transactions
    Should Be Equal As Numbers    ${response.status_code}    200

Check Recent Frauds Endpoint
    ${response}=    Get Request To API Endpoint    /frauds/recent
    Should Be Equal As Numbers    ${response.status_code}    200

Check System Health
    ${response}=    Get Request To API Endpoint    /
    Dictionary Should Contain Key    ${response.json()}    message