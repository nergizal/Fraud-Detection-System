*** Settings ***
Resource          ../resources/keywords.robot
Suite Setup       Initialize API Session

*** Test Cases ***
Send Normal Transaction E2E
    &{location}=    Create Dictionary    lat=${41.0082}    lon=${28.9784}
    &{payload}=     Create Dictionary    user_id=${999}    amount=${250.0}    location=${location}
    
    ${response}=    Post Request To API Endpoint    /    ${payload}
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message

Send Fraud Transaction E2E
    &{location}=    Create Dictionary    lat=${36.8841}    lon=${30.7056}
    &{payload}=     Create Dictionary    user_id=${777}    amount=${5000.0}    location=${location}
    
    ${response}=    Post Request To API Endpoint    /    ${payload}
    Should Be Equal As Numbers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    message