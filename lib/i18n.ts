export type Language = "en" | "hi" | "mr";

export interface Translations {
  appName: string;
  tagline: string;
  common: {
    back: string;
    cancel: string;
    save: string;
    delete: string;
    submit: string;
    loading: string;
    close: string;
    copied: string;
    copy: string;
    error: string;
    success: string;
    search: string;
    filter: string;
    all: string;
    none: string;
    refresh: string;
    exportCsv: string;
    printSummary: string;
    language: string;
    theme: string;
    signOut: string;
    role: string;
    status: string;
  };
  auth: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    sendOtp: string;
    sendingOtp: string;
    otpLabel: string;
    otpPlaceholder: string;
    verifyOtp: string;
    verifyingOtp: string;
    resendOtp: string;
    googleSignIn: string;
    linkGoogle: string;
    linkPhone: string;
    linkedBoth: string;
    accountExistsDiffCred: string;
    enterName: string;
    namePlaceholder: string;
    phoneRequired: string;
    invalidOtp: string;
  };
  onboarding: {
    welcome: string;
    selectSociety: string;
    createSociety: string;
    joinSociety: string;
    or: string;
    createTitle: string;
    createSubtitle: string;
    societyName: string;
    societyNamePlaceholder: string;
    societyType: string;
    address: string;
    addressPlaceholder: string;
    unitGroups: string;
    unitGroupsHelp: string;
    unitGroupsPlaceholder: string;
    creating: string;
    joinTitle: string;
    joinSubtitle: string;
    inviteCodeLabel: string;
    inviteCodePlaceholder: string;
    lookupCode: string;
    societyFound: string;
    selectUnitGroup: string;
    enterUnitNumber: string;
    unitNumberPlaceholder: string;
    requestJoin: string;
    requesting: string;
    pendingTitle: string;
    pendingSubtitle: string;
    pendingDesc: string;
    pendingCheckAgain: string;
    pendingLogout: string;
    rejectedTitle: string;
    rejectedDesc: string;
  };
  complaints: {
    title: string;
    newComplaint: string;
    myComplaints: string;
    societyComplaints: string;
    raiseTitle: string;
    complaintTitle: string;
    titlePlaceholder: string;
    description: string;
    descPlaceholder: string;
    category: string;
    priority: string;
    visibility: string;
    visibilityPublic: string;
    visibilityPublicHelp: string;
    visibilityPrivate: string;
    visibilityPrivateHelp: string;
    photos: string;
    photosHelp: string;
    uploadingPhotos: string;
    submitting: string;
    submittedSuccess: string;
    upvotes: string;
    upvoteAction: string;
    upvoted: string;
    reportedBy: string;
    assignedTo: string;
    unassigned: string;
    timeline: string;
    addUpdate: string;
    internalNotes: string;
    publicUpdates: string;
    updatePlaceholder: string;
    notePlaceholder: string;
    postUpdate: string;
    postNote: string;
    statusChange: string;
    assigneeChange: string;
    noComplaints: string;
    loadMore: string;
    showingResults: string;
  };
  categories: {
    water: string;
    electricity: string;
    lift: string;
    security: string;
    cleanliness: string;
    parking: string;
    noise: string;
    other: string;
  };
  priorities: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  statuses: {
    open: string;
    acknowledged: string;
    in_progress: string;
    resolved: string;
    closed: string;
  };
   roles: {
    resident: string;
    volunteer: string;
    admin: string;
  };
  tabs: {
    noticeboard: string;
    myIssues: string;
    raiseIssue: string;
    admin: string;
  };
  admin: {
    title: string;
    membersTab: string;
    pendingTab: string;
    settingsTab: string;
    unitsTab: string;
    pendingApprovals: string;
    approve: string;
    reject: string;
    makeAdmin: string;
    makeVolunteer: string;
    makeResident: string;
    removeMember: string;
    inviteCodeTitle: string;
    inviteCodeHelp: string;
    regenerateCode: string;
    unitManagement: string;
    addUnit: string;
    unitLabel: string;
    unitGroup: string;
    unitType: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "Sochi",
    tagline: "Transparent, multi-tenant housing society complaint management",
    common: {
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      submit: "Submit",
      loading: "Loading...",
      close: "Close",
      copied: "Copied to clipboard",
      copy: "Copy",
      error: "An error occurred",
      success: "Saved successfully",
      search: "Search complaints, flat numbers, titles...",
      filter: "Filter",
      all: "All",
      none: "None",
      refresh: "Refresh",
      exportCsv: "Export CSV",
      printSummary: "Print Noticeboard Summary",
      language: "Language",
      theme: "Theme",
      signOut: "Sign Out",
      role: "Role",
      status: "Status",
    },
    auth: {
      title: "Sign in to Sochi",
      subtitle: "Enter with phone OTP or Google account to access your society",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+91 98765 43210",
      sendOtp: "Send SMS Code",
      sendingOtp: "Sending code...",
      otpLabel: "6-Digit SMS Verification Code",
      otpPlaceholder: "123456",
      verifyOtp: "Verify & Enter",
      verifyingOtp: "Verifying...",
      resendOtp: "Resend Code",
      googleSignIn: "Continue with Google",
      linkGoogle: "Link Google Account",
      linkPhone: "Link Phone Number",
      linkedBoth: "Phone & Google both linked",
      accountExistsDiffCred: "Account already exists with a different sign-in method. Please sign in with that method first, then link your credentials.",
      enterName: "Full Name",
      namePlaceholder: "e.g. Ramesh Patel",
      phoneRequired: "Please enter a valid phone number with country code",
      invalidOtp: "Invalid or expired verification code",
    },
    onboarding: {
      welcome: "Welcome",
      selectSociety: "Select a Society",
      createSociety: "Register New Society",
      joinSociety: "Join Existing Society",
      or: "OR",
      createTitle: "Register a New Society",
      createSubtitle: "You will become the primary administrator for this society",
      societyName: "Society / Building Name",
      societyNamePlaceholder: "e.g. Gokuldham Co-op Housing Society",
      societyType: "Property Type",
      address: "Address & Landmark",
      addressPlaceholder: "e.g. Plot 42, Sector 17, Vashi, Navi Mumbai",
      unitGroups: "Wings / Blocks / Chawls",
      unitGroupsHelp: "Comma-separated list (e.g. Wing A, Wing B, Wing C)",
      unitGroupsPlaceholder: "Wing A, Wing B, Wing C",
      creating: "Registering Society...",
      joinTitle: "Join Your Society",
      joinSubtitle: "Enter the invite code provided by your society committee",
      inviteCodeLabel: "Society Invite Code",
      inviteCodePlaceholder: "e.g. W9K2PX7Y",
      lookupCode: "Verify Code",
      societyFound: "Society verified",
      selectUnitGroup: "Select Wing / Block",
      enterUnitNumber: "Flat / Room / Shop Number",
      unitNumberPlaceholder: "e.g. 402 or B-12",
      requestJoin: "Request to Join",
      requesting: "Sending Request...",
      pendingTitle: "Membership Pending Approval",
      pendingSubtitle: "Your request has been submitted to the society committee",
      pendingDesc: "An administrator or volunteer will review and approve your membership shortly. You will be automatically redirected once approved.",
      pendingCheckAgain: "Check Approval Status",
      pendingLogout: "Sign Out or Switch Society",
      rejectedTitle: "Membership Inactive",
      rejectedDesc: "Your membership for this society is currently inactive or was declined. Please contact your society committee.",
    },
    complaints: {
      title: "Complaints & Maintenance",
      newComplaint: "Raise Complaint",
      myComplaints: "My Issues",
      societyComplaints: "Public Noticeboard",
      raiseTitle: "Raise a Maintenance Issue",
      complaintTitle: "Short Summary / Title",
      titlePlaceholder: "e.g. Water leakage in 4th floor duct pipe",
      description: "Detailed Description",
      descPlaceholder: "Provide details: what happened, exact location, when it started...",
      category: "Category",
      priority: "Priority",
      visibility: "Visibility",
      visibilityPublic: "Public to Society (Recommended)",
      visibilityPublicHelp: "Visible to all residents on the noticeboard. Neighbors can upvote to avoid duplicate complaints.",
      visibilityPrivate: "Private to Committee Only",
      visibilityPrivateHelp: "Only visible to society administrators and assigned volunteers.",
      photos: "Attach Photos (Max 3)",
      photosHelp: "Photos will be compressed automatically before upload. Up to 2MB each.",
      uploadingPhotos: "Compressing and uploading photos...",
      submitting: "Submitting Complaint...",
      submittedSuccess: "Complaint submitted successfully",
      upvotes: "upvotes",
      upvoteAction: "I have this issue too",
      upvoted: "You upvoted this",
      reportedBy: "Reported by",
      assignedTo: "Assigned volunteer",
      unassigned: "Unassigned",
      timeline: "Activity & Updates",
      addUpdate: "Post Public Update",
      internalNotes: "Committee Internal Notes",
      publicUpdates: "Resident Updates",
      updatePlaceholder: "Share progress update visible to all residents...",
      notePlaceholder: "Internal committee note (vendor quote, phone numbers)...",
      postUpdate: "Post Update",
      postNote: "Save Private Note",
      statusChange: "Change Status",
      assigneeChange: "Assign to",
      noComplaints: "No complaints found matching this criteria.",
      loadMore: "Load More (20 per page)",
      showingResults: "Showing issues",
    },
    categories: {
      water: "Water Supply",
      electricity: "Electricity & Power",
      lift: "Elevator / Lift",
      security: "Security & Gate",
      cleanliness: "Cleanliness & Garbage",
      parking: "Parking",
      noise: "Noise Disturbance",
      other: "General / Other",
    },
    priorities: {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    },
    statuses: {
      open: "Open",
      acknowledged: "Acknowledged",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    },
    roles: {
      resident: "Resident",
      volunteer: "Volunteer",
      admin: "Admin",
    },
    tabs: {
      noticeboard: "Public Noticeboard",
      myIssues: "My Issues",
      raiseIssue: "Raise Issue",
      admin: "Admin",
    },
    admin: {
      title: "Society Administration",
      membersTab: "Members Directory",
      pendingTab: "Pending Approvals",
      settingsTab: "Society Settings",
      unitsTab: "Units & Wings",
      pendingApprovals: "Pending Member Requests",
      approve: "Approve Member",
      reject: "Decline",
      makeAdmin: "Promote to Admin",
      makeVolunteer: "Make Volunteer",
      makeResident: "Set as Resident",
      removeMember: "Remove from Society",
      inviteCodeTitle: "Resident Invite Code",
      inviteCodeHelp: "Share this code on society WhatsApp groups or noticeboards so residents can join.",
      regenerateCode: "Regenerate Code",
      unitManagement: "Units & Flats Directory",
      addUnit: "Add Unit / Flat",
      unitLabel: "Unit Number / Name",
      unitGroup: "Wing / Block / Floor",
      unitType: "Unit Type",
    },
  },
  hi: {
    appName: "सोची",
    tagline: "पारदर्शी और सुरक्षित हाउसिंग सोसाइटी शिकायत प्रबंधन",
    common: {
      back: "पीछे जाएं",
      cancel: "रद्द करें",
      save: "सुरक्षित करें",
      delete: "हटाएं",
      submit: "जमा करें",
      loading: "लोड हो रहा है...",
      close: "बंद करें",
      copied: "कॉपी हो गया",
      copy: "कॉपी करें",
      error: "त्रुटि हुई",
      success: "सफलतापूर्वक सुरक्षित हुआ",
      search: "शिकायत, फ्लैट नंबर, शीर्षक खोजें...",
      filter: "फ़िल्टर",
      all: "सभी",
      none: "कोई नहीं",
      refresh: "ताज़ा करें",
      exportCsv: "CSV डाउनलोड करें",
      printSummary: "नोटिस बोर्ड सारांश प्रिंट करें",
      language: "भाषा",
      theme: "थीम",
      signOut: "लॉग आउट",
      role: "भूमिका",
      status: "स्थिति",
    },
    auth: {
      title: "सोची में साइन इन करें",
      subtitle: "अपनी सोसाइटी तक पहुँचने के लिए फ़ोन OTP या Google खाते से प्रवेश करें",
      phoneLabel: "फ़ोन नंबर",
      phonePlaceholder: "+91 98765 43210",
      sendOtp: "SMS कोड भेजें",
      sendingOtp: "कोड भेजा जा रहा है...",
      otpLabel: "6-अंकों का SMS सत्यापन कोड",
      otpPlaceholder: "123456",
      verifyOtp: "सत्यापित करें और प्रवेश करें",
      verifyingOtp: "सत्यापन जारी है...",
      resendOtp: "कोड दोबारा भेजें",
      googleSignIn: "Google से आगे बढ़ें",
      linkGoogle: "Google खाता लिंक करें",
      linkPhone: "फ़ोन नंबर लिंक करें",
      linkedBoth: "फ़ोन और Google दोनों लिंक हैं",
      accountExistsDiffCred: "इस ईमेल से पहले से खाता मौजूद है। कृपया पहले उस विधि से लॉगिन करें और फिर लिंक करें।",
      enterName: "पूरा नाम",
      namePlaceholder: "उदा. रमेश पटेल",
      phoneRequired: "कृपया देश कोड के साथ मान्य फ़ोन नंबर दर्ज करें",
      invalidOtp: "अमान्य या समाप्त हो चुका सत्यापन कोड",
    },
    onboarding: {
      welcome: "स्वागत है",
      selectSociety: "सोसाइटी चुनें",
      createSociety: "नई सोसाइटी पंजीकृत करें",
      joinSociety: "मौजूदा सोसाइटी में जुड़ें",
      or: "या",
      createTitle: "नई सोसाइटी पंजीकृत करें",
      createSubtitle: "आप इस सोसाइटी के मुख्य व्यवस्थापक (Admin) बनेंगे",
      societyName: "सोसाइटी / इमारत का नाम",
      societyNamePlaceholder: "उदा. गोकुलधाम को-ऑप हाउसिंग सोसाइटी",
      societyType: "संपत्ति का प्रकार",
      address: "पता व लैंडमार्क",
      addressPlaceholder: "उदा. प्लॉट 42, सेक्टर 17, वाशी, नवी मुंबई",
      unitGroups: "विंग्स / ब्लॉक्स / चॉल",
      unitGroupsHelp: "अल्पविराम से अलग करें (उदा. विंग A, विंग B, विंग C)",
      unitGroupsPlaceholder: "विंग A, विंग B, विंग C",
      creating: "सोसाइटी बन रही है...",
      joinTitle: "अपनी सोसाइटी में शामिल हों",
      joinSubtitle: "सोसाइटी समिति द्वारा दिया गया इनवाइट कोड दर्ज करें",
      inviteCodeLabel: "सोसाइटी इनवाइट कोड",
      inviteCodePlaceholder: "उदा. W9K2PX7Y",
      lookupCode: "कोड जांचें",
      societyFound: "सोसाइटी मिल गई",
      selectUnitGroup: "विंग / ब्लॉक चुनें",
      enterUnitNumber: "फ्लैट / कमरा / दुकान नंबर",
      unitNumberPlaceholder: "उदा. 402 या B-12",
      requestJoin: "जुड़ने का अनुरोध भेजें",
      requesting: "अनुरोध भेजा जा रहा है...",
      pendingTitle: "स्वीकृति लंबित है",
      pendingSubtitle: "आपका अनुरोध सोसाइटी समिति को भेज दिया गया है",
      pendingDesc: "सोसाइटी के व्यवस्थापक जल्द ही आपके अनुरोध की समीक्षा करेंगे। स्वीकृत होते ही आपको सोसाइटी का एक्सेस मिल जाएगा।",
      pendingCheckAgain: "स्थिति दोबारा जांचें",
      pendingLogout: "लॉग आउट करें या दूसरी सोसाइटी चुनें",
      rejectedTitle: "सदस्यता निष्क्रिय है",
      rejectedDesc: "इस सोसाइटी के लिए आपकी सदस्यता निष्क्रिय है। कृपया अपनी सोसाइटी समिति से संपर्क करें।",
    },
    complaints: {
      title: "शिकायतें एवं रखरखाव",
      newComplaint: "शिकायत दर्ज करें",
      myComplaints: "मेरी शिकायतें",
      societyComplaints: "सोसाइटी नोटिस बोर्ड",
      raiseTitle: "नई रखरखाव शिकायत दर्ज करें",
      complaintTitle: "संक्षिप्त विवरण / शीर्षक",
      titlePlaceholder: "उदा. चौथी मंजिल की पाइपलाइन से पानी का रिसाव",
      description: "विस्तृत विवरण",
      descPlaceholder: "समस्या का पूरा विवरण लिखें: कब शुरू हुई, सटीक स्थान...",
      category: "श्रेणी",
      priority: "प्राथमिकता",
      visibility: "दृश्यता (Visibility)",
      visibilityPublic: "सोसाइटी में सभी को दिखे (अनुशंसित)",
      visibilityPublicHelp: "नोटिस बोर्ड पर सभी निवासियों को दिखेगी। पड़ोसी भी समर्थन (Upvote) कर सकते हैं।",
      visibilityPrivate: "केवल समिति को दिखे (निजी)",
      visibilityPrivateHelp: "केवल सोसाइटी व्यवस्थापकों और कार्यकर्ताओं को दिखाई देगी।",
      photos: "फ़ोटो जोड़ें (अधिकतम 3)",
      photosHelp: "अपलोड से पहले फ़ोटो अपने-आप कंप्रेस हो जाएंगी (अधिकतम 2MB प्रत्येक)।",
      uploadingPhotos: "फ़ोटो कंप्रेस और अपलोड हो रही हैं...",
      submitting: "शिकायत दर्ज हो रही है...",
      submittedSuccess: "शिकायत सफलतापूर्वक दर्ज हो गई",
      upvotes: "समर्थन",
      upvoteAction: "मुझे भी यह समस्या है",
      upvoted: "आपने समर्थन किया है",
      reportedBy: "दर्जकर्ता",
      assignedTo: "नियुक्त कार्यकर्ता",
      unassigned: "अनिर्दिष्ट",
      timeline: "गतिविधि व अपडेट",
      addUpdate: "सार्वजनिक अपडेट दें",
      internalNotes: "समिति के आंतरिक नोट्स",
      publicUpdates: "निवासी अपडेट्स",
      updatePlaceholder: "काम की प्रगति के बारे में सभी को बताएं...",
      notePlaceholder: "समिति का निजी नोट (वेंडर का कोटेशन, नंबर आदि)...",
      postUpdate: "अपडेट पोस्ट करें",
      postNote: "निजी नोट सुरक्षित करें",
      statusChange: "स्थिति बदलें",
      assigneeChange: "कार्यकर्ता नियुक्त करें",
      noComplaints: "इस फ़िल्टर में कोई शिकायत नहीं मिली।",
      loadMore: "और दिखाएं (20 प्रति पृष्ठ)",
      showingResults: "शिकायतें दिख रही हैं",
    },
    categories: {
      water: "पानी की आपूर्ति",
      electricity: "बिजली व पावर",
      lift: "लिफ्ट / एलिवेटर",
      security: "सुरक्षा व मुख्य गेट",
      cleanliness: "साफ़-सफ़ाई व कचरा",
      parking: "पार्किंग",
      noise: "शोर-शराबा",
      other: "अन्य / सामान्य",
    },
    priorities: {
      low: "सामान्य (Low)",
      medium: "मध्यम (Medium)",
      high: "उच्च (High)",
      critical: "अति-गंभीर (Critical)",
    },
    statuses: {
      open: "खुली (Open)",
      acknowledged: "स्वीकृत (Acknowledged)",
      in_progress: "कार्य प्रगति पर (In Progress)",
      resolved: "समाधान हुआ (Resolved)",
      closed: "बंद (Closed)",
    },
    roles: {
      resident: "निवासी",
      volunteer: "कार्यकर्ता",
      admin: "व्यवस्थापक (Admin)",
    },
    tabs: {
      noticeboard: "सार्वजनिक नोटिसबोर्ड",
      myIssues: "मेकी शिकायतें",
      raiseIssue: "नई शिकायत दर्ज करें",
      admin: "प्रबंधन",
    },
    admin: {
      title: "सोसाइटी प्रबंधन",
      membersTab: "सदस्य सूची",
      pendingTab: "लंबित स्वीकृतियां",
      settingsTab: "सोसाइटी सेटिंग्स",
      unitsTab: "विंग्स व फ्लैट्स",
      pendingApprovals: "लंबित सदस्य अनुरोध",
      approve: "स्वीकृत करें",
      reject: "अस्वीकार करें",
      makeAdmin: "एडमिन बनाएं",
      makeVolunteer: "कार्यकर्ता बनाएं",
      makeResident: "निवासी बनाएं",
      removeMember: "सोसाइटी से हटाएं",
      inviteCodeTitle: "रेजिडेंट इनवाइट कोड",
      inviteCodeHelp: "यह कोड सोसाइटी के व्हाट्सएप ग्रुप या नोटिस बोर्ड पर साझा करें ताकि निवासी जुड़ सकें।",
      regenerateCode: "नया कोड बनाएं",
      unitManagement: "फ्लैट्स व विंग्स की सूची",
      addUnit: "नया फ्लैट जोड़ें",
      unitLabel: "फ्लैट / कमरा नंबर",
      unitGroup: "विंग / ब्लॉक / तल",
      unitType: "प्रकार",
    },
  },
  mr: {
    appName: "सोची",
    tagline: "पारदर्शक आणि सुरक्षित गृहनिर्माण संस्था तक्रार व्यवस्थापन",
    common: {
      back: "मागे जा",
      cancel: "रद्द करा",
      save: "जतन करा",
      delete: "हटवा",
      submit: "सादर करा",
      loading: "लोड होत आहे...",
      close: "बंद करा",
      copied: "कॉपी केले",
      copy: "कॉपी करा",
      error: "त्रुटी आली",
      success: "यशस्वीरित्या जतन झाले",
      search: "तक्रार, फ्लॅट क्रमांक, शीर्षक शोधा...",
      filter: "फिल्टर",
      all: "सर्व",
      none: "काही नाही",
      refresh: "ताजे करा",
      exportCsv: "CSV डाउनलोड करा",
      printSummary: "नोटीस बोर्ड सारांश प्रिंट करा",
      language: "भाषा",
      theme: "थीम",
      signOut: "बाहेर पडा",
      role: "भूमिका",
      status: "स्थिती",
    },
    auth: {
      title: "सोचीमध्ये साइन इन करा",
      subtitle: "आपल्या सोसायटीमध्ये प्रवेश करण्यासाठी फोन OTP किंवा Google खाते वापरा",
      phoneLabel: "फोन नंबर",
      phonePlaceholder: "+91 98765 43210",
      sendOtp: "SMS कोड पाठवा",
      sendingOtp: "कोड पाठवत आहे...",
      otpLabel: "६-अंकी SMS पडताळणी कोड",
      otpPlaceholder: "123456",
      verifyOtp: "पडताळणी करा आणि प्रवेश करा",
      verifyingOtp: "पडताळणी सुरू आहे...",
      resendOtp: "कोड पुन्हा पाठवा",
      googleSignIn: "Google सह पुढे जा",
      linkGoogle: "Google खाते लिंक करा",
      linkPhone: "फोन नंबर लिंक करा",
      linkedBoth: "फोन आणि Google दोन्ही लिंक आहेत",
      accountExistsDiffCred: "या खात्यासाठी वेगळी पद्धत वापरली आहे. कृपया आधी त्या पद्धतीने लॉगिन करा आणि नंतर लिंक करा.",
      enterName: "पूर्ण नाव",
      namePlaceholder: "उदा. सचिन जोशी",
      phoneRequired: "कृपया देश कोडसह वैध फोन नंबर टाका",
      invalidOtp: "अवैध किंवा कालबाह्य पडताळणी कोड",
    },
    onboarding: {
      welcome: "स्वागत आहे",
      selectSociety: "सोसायटी निवडा",
      createSociety: "नवीन सोसायटी नोंदवा",
      joinSociety: "विद्यमान सोसायटीमध्ये सामील व्हा",
      or: "किंवा",
      createTitle: "नवीन सोसायटी नोंदवा",
      createSubtitle: "आपण या सोसायटीचे मुख्य व्यवस्थापक (Admin) व्हाल",
      societyName: "सोसायटी / इमारतीचे नाव",
      societyNamePlaceholder: "उदा. गोकुळधाम सह. गृहनिर्माण संस्था",
      societyType: "मालमत्तेचा प्रकार",
      address: "पत्ता व लँडमार्क",
      addressPlaceholder: "उदा. प्लॉट ४२, सेक्टर १७, वाशी, नवी मुंबई",
      unitGroups: "विंग्स / ब्लॉक्स / चाळ",
      unitGroupsHelp: "स्वल्पविरामाने वेगळे करा (उदा. विंग A, विंग B, विंग C)",
      unitGroupsPlaceholder: "विंग A, विंग B, विंग C",
      creating: "सोसायटी तयार होत आहे...",
      joinTitle: "सोसायटीमध्ये सामील व्हा",
      joinSubtitle: "सोसायटी समितीने दिलेला इनव्हाइट कोड टाका",
      inviteCodeLabel: "सोसायटी इनव्हाइट कोड",
      inviteCodePlaceholder: "उदा. W9K2PX7Y",
      lookupCode: "कोड तपासा",
      societyFound: "सोसायटी पडताळली",
      selectUnitGroup: "विंग / ब्लॉक निवडा",
      enterUnitNumber: "फ्लॅट / खोली / दुकान क्रमांक",
      unitNumberPlaceholder: "उदा. ४०२ किंवा B-12",
      requestJoin: "सामील होण्याची विनंती पाठवा",
      requesting: "विनंती पाठवत आहे...",
      pendingTitle: "मंजुरी प्रलंबित आहे",
      pendingSubtitle: "आपली विनंती सोसायटी समितीकडे पाठवली गेली आहे",
      pendingDesc: "सोसायटी व्यवस्थापक लवकरच आपल्या विनंतीचे पुनरावलोकन करतील. मंजुरी मिळताच आपल्याला सोसायटीचा प्रवेश मिळेल.",
      pendingCheckAgain: "स्थिती पुन्हा तपासा",
      pendingLogout: "बाहेर पडा किंवा दुसरी सोसायटी निवडा",
      rejectedTitle: "सदस्यत्व निष्क्रिय आहे",
      rejectedDesc: "या सोसायटीसाठी आपले सदस्यत्व सध्या निष्क्रिय आहे. कृपया आपल्या सोसायटी समितीशी संपर्क साधा.",
    },
    complaints: {
      title: "तक्रारी आणि देखभाल",
      newComplaint: "तक्रार नोंदवा",
      myComplaints: "माझ्या तक्रारी",
      societyComplaints: "सोसायटी नोटीस बोर्ड",
      raiseTitle: "नवीन देखभाल तक्रार नोंदवा",
      complaintTitle: "थोडक्यात शीर्षक",
      titlePlaceholder: "उदा. चौथ्या मजल्यावरील पाईपमधून पाणी गळती",
      description: "सविस्तर माहिती",
      descPlaceholder: "समस्येची संपूर्ण माहिती द्या: केव्हा सुरू झाली, अचूक जागा...",
      category: "वर्गवारी",
      priority: "प्राधान्य",
      visibility: "दृश्यमानता",
      visibilityPublic: "सोसायटीमध्ये सर्वांना दिसावे (शिफारस)",
      visibilityPublicHelp: "नोटीस बोर्डवर सर्व रहिवाशांना दिसेल. इतर रहिवासीही पाठिंबा (Upvote) देऊ शकतात.",
      visibilityPrivate: "फक्त समितीला दिसावे (खाजगी)",
      visibilityPrivateHelp: "केवळ सोसायटी व्यवस्थापक आणि नेमलेल्या स्वयंसेवकांना दिसेल.",
      photos: "फोटो जोडा (कमाल ३)",
      photosHelp: "अपलोड करण्यापूर्वी फोटो आपोआप कॉम्प्रेस केले जातील (प्रत्येकी कमाल २ MB).",
      uploadingPhotos: "फोटो कॉम्प्रेस आणि अपलोड होत आहेत...",
      submitting: "तक्रार नोंदवत आहे...",
      submittedSuccess: "तक्रार यशस्वीरित्या नोंदवली गेली",
      upvotes: "पाठिंबा",
      upvoteAction: "मलाही हीच समस्या आहे",
      upvoted: "आपण पाठिंबा दिला आहे",
      reportedBy: "नोंदवणारे",
      assignedTo: "नेमलेले स्वयंसेवक",
      unassigned: "नेमणूक नाही",
      timeline: "हालचाली आणि अपडेट्स",
      addUpdate: "सार्वजनिक अपडेट द्या",
      internalNotes: "समितीच्या अंतर्गत नोंदी",
      publicUpdates: "रहिवासी अपडेट्स",
      updatePlaceholder: "कामाच्या प्रगतीबद्दल माहिती लिहा...",
      notePlaceholder: "समितीची खाजगी नोंद (कोटेशन, संपर्क क्रमांक)...",
      postUpdate: "अपडेट पोस्ट करा",
      postNote: "खाजगी नोंद जतन करा",
      statusChange: "स्थिती बदला",
      assigneeChange: "स्वयंसेवक नेमा",
      noComplaints: "या फिल्टरनुसार कोणतीही तक्रार आढळली नाही.",
      loadMore: "आणखी पहा (२० प्रति पृष्ठ)",
      showingResults: "तक्रारी दाखवत आहे",
    },
    categories: {
      water: "पाणी पुरवठा",
      electricity: "वीज आणि पावर",
      lift: "लिफ्ट / एलिव्हेटर",
      security: "सुरक्षा आणि मुख्य गेट",
      cleanliness: "स्वच्छता आणि कचरा",
      parking: "पार्किंग",
      noise: "आवाजाचा त्रास",
      other: "इतर / सामान्य",
    },
    priorities: {
      low: "कमी (Low)",
      medium: "मध्यम (Medium)",
      high: "जास्त (High)",
      critical: "तातडीची (Critical)",
    },
    statuses: {
      open: "उघडी (Open)",
      acknowledged: "स्वीकारली (Acknowledged)",
      in_progress: "काम सुरू (In Progress)",
      resolved: "निवारण झाले (Resolved)",
      closed: "बंद (Closed)",
    },
    roles: {
      resident: "रहिवासी",
      volunteer: "स्वयंसेवक",
      admin: "व्यवस्थापक (Admin)",
    },
    tabs: {
      noticeboard: "सार्वजनिक नोटिसबोर्ड",
      myIssues: "माझ्या तक्रारी",
      raiseIssue: "नई तक्रार दाखल करा",
      admin: "व्यवस्थापन",
    },
    admin: {
      title: "सोसायटी प्रशासन",
      membersTab: "सदस्य यादी",
      pendingTab: "प्रलंबित मंजुरी",
      settingsTab: "सोसायटी सेटिंग्ज",
      unitsTab: "विंग्स आणि फ्लॅट्स",
      pendingApprovals: "प्रलंबित सदस्य विनंत्या",
      approve: "मंजूर करा",
      reject: "नाकारा",
      makeAdmin: "अ‍ॅडमिन बनवा",
      makeVolunteer: "स्वयंसेवक बनवा",
      makeResident: "रहिवासी ठेवा",
      removeMember: "सोसायटीतून काढा",
      inviteCodeTitle: "रहिवासी इनव्हाइट कोड",
      inviteCodeHelp: "हा कोड सोसायटीच्या व्हॉट्सअ‍ॅप ग्रुपवर किंवा नोटीस बोर्डवर सामायिक करा जेणेकरून रहिवासी सामील होऊ शकतील.",
      regenerateCode: "नवीन कोड तयार करा",
      unitManagement: "फ्लॅट्स आणि विंग्स व्यवस्थापन",
      addUnit: "नवीन फ्लॅट जोडा",
      unitLabel: "फ्लॅट / खोली क्रमांक",
      unitGroup: "विंग / ब्लॉक / मजला",
      unitType: "प्रकार",
    },
  },
};
