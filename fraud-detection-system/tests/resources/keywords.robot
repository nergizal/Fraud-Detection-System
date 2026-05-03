*** Settings ***
Library           RequestsLibrary
Library           Collections

*** Variables ***
${BASE_URL}       http://localhost:8000

*** Keywords ***
Initialize API Session
    Create Session    mysession    ${BASE_URL}

Get Request To API Endpoint
    [Arguments]    ${endpoint}
    ${response}=    GET On Session    mysession    ${endpoint}
    [Return]    ${response}

Post Request To API Endpoint
    [Arguments]    ${endpoint}    ${payload}
    ${response}=    POST On Session    mysession    ${endpoint}    json=${payload}
    [Return]    ${response}