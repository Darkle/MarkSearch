var safeBrowsingDetails = {
//  phishing: {
//    bold: `Warning—Suspected phishing page.`,
//    explanation: `This page may be a forgery or imitation of
//                    another website, designed to trick users into sharing
//                    personal or financial information. Entering any personal
//                    information on this page may result in identity theft
//                    or other abuse. You can find out more about phishing
//                    from <a href='https://www.antiphishing.org'>www.antiphishing.org</a>.
//                     - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`
//
//  },
  phishing: {
    bold: `Warning—Deceptive site ahead.`,
    explanation: `Attackers on this site may trick you into doing
                  something dangerous like installing software or revealing your personal information (for example,
                  passwords, phone numbers, or credit cards).
                  You can find out more about social engineering (phishing) at
                  <a href="https://support.google.com/webmasters/answer/6350487" target="_blank">
                    Social Engineering (Phishing and Deceptive Sites)</a>
                  or from
                  <a href="//www.google.com/url?q=http://www.antiphishing.org&amp;usg=AFrqEzdc43cbWnGpYdvxqO6R0Xvs3hrtSQ" target="_blank">www.antiphishing.org</a>`
  },
  malware: {
    bold: `Warning—Visiting this web site may harm your computer.`,
    explanation: `This page appears to contain malicious code that could be
                downloaded to your computer without your consent. You can
                learn more about harmful web content including viruses and
                other malicious code and how to protect your computer at
                <a href='https://StopBadware.org'>StopBadware.org</a>.
                  - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`

  },
  unwanted: {
    bold: `Warning—The site ahead may contain harmful programs.`,
    explanation: `Attackers might attempt to trick you into installing programs
                that harm your browsing experience (for example, by changing
                your homepage or showing extra ads on sites you visit). You
                can learn more about unwanted software at
                <a href='https://www.google.com/about/company/unwanted-software-policy.html'>https://www.google.com/about/company/unwanted-software-policy.html</a>.
                 - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`
  }
}

module.exports = safeBrowsingDetails