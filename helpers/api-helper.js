class ApiHelper{
  getAPICommonData(clientDt) {
    let commondata = '<ACORD xmlns="http://www.ACORD.org/standards/PC_Surety/ACORD1/xml/Stillwater">\n' +
      '  <SignonRq>\n' +
      '    <SignonTransport>\n' +
      '      <SignonRoleCd>Agent</SignonRoleCd>\n' +
      '      <CustId>\n' +
      '        <SPName>com.CNG</SPName>\n' +
      '        <CustPermId>XMLCNGTEST</CustPermId>\n' +
      '        <CustLoginId>XMLCNGTEST</CustLoginId>\n' +
      '      </CustId>\n' +
      '    </SignonTransport> <!-- now -->\n' +
      '    <ClientDt>' + clientDt + '</ClientDt>\n' +
      '    <CustLangPref>ENG</CustLangPref>\n' +
      '    <ClientApp>\n' +
      '      <Org>Internet</Org>\n' +
      '      <Name>com.CNG</Name>\n' +
      '      <Version>1.6</Version>\n' +
      '    </ClientApp>\n' +
      '  </SignonRq>\n';
    return commondata;
  }
}

module.exports = ApiHelper;
