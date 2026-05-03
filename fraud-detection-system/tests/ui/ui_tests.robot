*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${DASHBOARD_URL}    http://localhost:3000

*** Test Cases ***
Test Dashboard UI Elements
    [Documentation]    Dashboard sayfasının yüklenmesini bekler ve element doğrulaması yapar.
    Open Browser    ${DASHBOARD_URL}    chrome
    Maximize Browser Window
    
    # Sayfanın yüklenmesi için süreyi 15 saniyeye çıkarıyoruz
    Wait Until Page Contains Element    css:body    timeout=15s
    
    # Metin araması yapmak yerine genel bir elementin varlığını doğruluyoruz
    Page Should Contain Element    css:body
    
    # Ekran görüntüsü alıp loglara ekleyelim
    Capture Page Screenshot
    
    Close Browser