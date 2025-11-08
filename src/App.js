import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [voters, setVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [editingMobile, setEditingMobile] = useState(null); // Track which voter's mobile is being edited
  const [editMobileValue, setEditMobileValue] = useState(''); // Temporary value while editing
  const [updatingMobile, setUpdatingMobile] = useState(false); // Track update loading state
  const [editingAddress, setEditingAddress] = useState(null); // Track which voter's address is being edited
  const [editAddressValue, setEditAddressValue] = useState(''); // Temporary value while editing address
  const [updatingAddress, setUpdatingAddress] = useState(false); // Track address update loading state
  const [syncingToDatabase, setSyncingToDatabase] = useState(false); // Track database update status
  const [whatsappNumber, setWhatsappNumber] = useState(''); // WhatsApp number for sending message
  const [showWhatsAppInput, setShowWhatsAppInput] = useState(false); // Show/hide WhatsApp input
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false); // Track WhatsApp sending status
  const [autoSendingWhatsApp, setAutoSendingWhatsApp] = useState(false); // Track auto-send status
  const [autoSentCount, setAutoSentCount] = useState(0); // Count of auto-sent messages

  // Memoized: Filter voters based on search query
  const filteredVoters = useMemo(() => {
    // Don't show any voters until user searches
    if (!searchQuery.trim()) {
      return [];
    }

    const searchLower = searchQuery.toLowerCase().trim();
    const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);
    
    return voters.filter(voter => {
      // Get all searchable fields
      const nameEn = (voter['नाव (इंग्रजी)'] || '').toLowerCase().trim();
      const nameMr = (voter['नाव (मराठी)'] || '').toLowerCase().trim();
      const epicId = (voter['मतदान कार्ड क्र.'] || '').toLowerCase().trim();
      const mobile = (voter['मोबाईल नं.'] || '').toLowerCase().trim();
      const serialNo = (voter['अनु क्र.'] || '').toLowerCase().trim();
      const houseNo = (voter['घर क्र.'] || '').toLowerCase().trim();
      const age = (voter['वय'] || '').toString().trim();

      // If single search term, check all fields
      if (searchTerms.length === 1) {
        const term = searchTerms[0];
        return nameEn.includes(term) ||
               nameMr.includes(term) ||
               epicId.includes(term) ||
               mobile.includes(term) ||
               serialNo.includes(term) ||
               houseNo.includes(term) ||
               age.includes(term);
      }
      
      // If multiple search terms, check if all terms match in name fields
      // This helps with "First Last" searches
      const fullNameEn = nameEn.replace(/\s+/g, ' ');
      const fullNameMr = nameMr.replace(/\s+/g, ' ');
      
      const allTermsMatchEn = searchTerms.every(term => fullNameEn.includes(term));
      const allTermsMatchMr = searchTerms.every(term => fullNameMr.includes(term));
      
      return allTermsMatchEn || 
             allTermsMatchMr ||
             epicId.includes(searchLower) ||
             mobile.includes(searchLower) ||
             serialNo.includes(searchLower) ||
             houseNo.includes(searchLower) ||
             age.includes(searchLower);
    });
  }, [voters, searchQuery]);

  // Memoized: Calculate gender counts from full database (all voters)
  const genderStats = useMemo(() => {
    const males = voters.filter(voter => 
      voter['लिंग (इंग्रजी)'] === 'Male' || voter['लिंग (मराठी)'] === 'पुरुष'
    ).length;
    
    const females = voters.filter(voter => 
      voter['लिंग (इंग्रजी)'] === 'Female' || voter['लिंग (मराठी)'] === 'स्त्री'
    ).length;
    
    return { males, females, total: voters.length };
  }, [voters]);

  // Memoized: Paginated voters
  const paginatedVoters = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredVoters.slice(startIndex, endIndex);
  }, [filteredVoters, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);

  // No localStorage - data comes directly from database

  // Fetch voter data
  const fetchVoterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use new Node.js API endpoint
      const apiUrl = 'https://nodejs-2-i1dr.onrender.com/api/voters/';
      
      console.log('📡 Fetching voter data from:', apiUrl);
      console.log('⏳ Starting API request...');
      
      const response = await axios.get(apiUrl, {
        timeout: 120000, // Increased timeout to 2 minutes
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all responses to handle errors properly
        }
      });
      
      console.log('✅ API request completed');
      
      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Headers:', response.headers['content-type']);
      console.log('📥 API Response Data Type:', typeof response.data);
      
      // Check if response is HTML (error page)
      if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))) {
        console.error('❌ API returned HTML instead of JSON.');
        setError('API HTML error response मिळाला। कृपया API endpoint verify करें।');
        return;
      }
      
      // Try to parse JSON if it's a string
      let result = response.data;
      if (typeof response.data === 'string') {
        try {
          result = JSON.parse(response.data);
        } catch (e) {
          console.error('❌ Failed to parse JSON:', response.data.substring(0, 200));
          setError('API ने invalid JSON return किया। कृपया API endpoint check करें।');
          return;
        }
      }
      
      console.log('📊 Parsed Result:', result);
      
      // Handle Node.js API response format: { success: true, data: [...], count: ... }
      if (result && result.success && result.data && Array.isArray(result.data)) {
        // Map Node.js API fields to existing field names
        let validVoters = result.data
          .filter((voter) => {
            // Filter out empty records
            return voter && (voter.name || voter.name_mr) && (voter.name?.trim() || voter.name_mr?.trim());
          })
          .map((voter, index) => {
            // Map Node.js API fields to existing field names used in the app
            return {
              'अनु क्र.': voter.serialNumber || '',
              'घर क्र.': voter.houseNumber || '',
              'नाव (इंग्रजी)': voter.name || '',
              'नाव (मराठी)': voter.name_mr || '',
              'लिंग (इंग्रजी)': voter.gender || '',
              'लिंग (मराठी)': voter.gender_mr || '',
              'वय': voter.age ? voter.age.toString() : '',
              'मतदान कार्ड क्र.': voter.voterIdCard || '',
              'मोबाईल नं.': voter.mobileNumber || '',
              id: voter._id || index + 1, // Use MongoDB _id or index
              _originalId: voter._id // Keep original ID for reference
            };
          });
        
        setVoters(validVoters);
        console.log(`✅ Loaded ${validVoters.length} voter records from Node.js API`);
        console.log(`📊 Total count: ${result.count || result.totalCount || validVoters.length}`);
      } else {
        console.error('❌ Invalid API response format:', result);
        setError(`API कडून डेटा मिळवण्यात समस्या आली। Response: ${JSON.stringify(result).substring(0, 100)}`);
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.code === 'ECONNABORTED') {
        setError('विनंती टाइमआउट! कृपया नंतर पुन्हा प्रयत्न करा।');
      } else if (err.response) {
        const status = err.response.status;
        const statusText = err.response.statusText || 'Unknown Error';
        const errorData = err.response.data;
        
        // Check if it's HTML error
        if (typeof errorData === 'string' && (errorData.includes('<!DOCTYPE') || errorData.includes('<html'))) {
          setError(`सर्व्हर त्रुटी (${status}): API HTML error page return कर रहा है। कृपया API endpoint verify करें।`);
        } else {
          setError(`सर्व्हर त्रुटी: ${status} ${statusText}। कृपया नंतर पुन्हा प्रयत्न करा।`);
        }
      } else if (err.request) {
        setError('नेटवर्क त्रुटी: सर्व्हरशी कनेक्ट होऊ शकले नाही। कृपया इंटरनेट कनेक्शन तपासा।');
      } else {
        setError(`त्रुटी: ${err.message || 'डेटा लोड करण्यात समस्या आली।'}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchVoterData();
  }, [fetchVoterData]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Send WhatsApp message automatically (silent, no alerts) - for auto-send feature
  // Unified helper function to get the correct API endpoint URL with fallback
  const getWhatsAppApiUrl = useCallback(() => {
    // Check if we're in development (localhost) or production
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    
    // List of possible endpoints to try (in order of preference)
    const endpoints = [];
    
    // Always try Vercel serverless function first (works everywhere if deployed)
    // In development, this will work if Vercel is deployed
    endpoints.push('/api/whatsapp-send');
    
    if (isLocalhost) {
      // Development: Try localhost proxy server (if running separately)
      // Note: This might conflict with React dev server on port 3000
      // So we try it last as fallback
      endpoints.push('http://localhost:3001/api/whatsapp-send');
    }
    
    return endpoints;
  }, []);

  // Unified helper function to send WhatsApp message with retry logic
  // NOTE: Cannot call WhatsApp API directly from browser due to CORS policy
  // Must use proxy server (setupProxy.js) or Vercel serverless function
  const sendWhatsAppMessageCore = useCallback(async (phoneNumber, message, phoneNumberId, apiKey, retries = 0) => {
    const endpoints = getWhatsAppApiUrl();
    let lastError = null;
    
    // Try each proxy endpoint (browser cannot call WhatsApp API directly due to CORS)
    for (let endpointIndex = 0; endpointIndex < endpoints.length; endpointIndex++) {
      const proxyApiUrl = endpoints[endpointIndex];
      
      try {
        console.log(`📤 Attempting WhatsApp send via proxy (${endpointIndex + 1}/${endpoints.length}): ${proxyApiUrl}`);
        
        const payload = {
          phone_number: phoneNumber,
          message: message,
          phone_number_id: phoneNumberId,
          api_key: apiKey
        };
        
        const response = await axios.post(proxyApiUrl, payload, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: false,
          validateStatus: function (status) {
            return status >= 200 && status < 500; // Accept all to handle errors
          }
        });
        
        console.log(`📥 Response Status: ${response.status}`);
        console.log(`📥 Response Type: ${typeof response.data}`);
        
        // Check if response is HTML error page (proxy server not running)
        let result;
        if (typeof response.data === 'string') {
          // Check for HTML error pages
          if (response.data.includes('<!DOCTYPE') || 
              response.data.includes('<html') || 
              response.data.includes('Cannot POST') ||
              response.data.includes('<pre>') ||
              response.data.includes('Error')) {
            console.error('❌ HTML Error Page detected - Proxy server not running!');
            console.error('Response preview:', response.data.substring(0, 200));
            
            // Create helpful error message
            lastError = new Error('PROXY_SERVER_NOT_RUNNING');
            continue; // Try next endpoint
          }
          
          // Try to parse as JSON
          try {
            result = JSON.parse(response.data);
          } catch (e) {
            console.error('❌ Failed to parse JSON:', response.data.substring(0, 200));
            lastError = new Error('Invalid JSON response from proxy');
            continue;
          }
        } else {
          result = response.data;
        }
        
        // Check for errors in response
        if (result && result.error) {
          const errorMsg = result.error.message || JSON.stringify(result.error);
          console.error('❌ WhatsApp API Error:', errorMsg);
          lastError = new Error(errorMsg);
          
          // If it's a validation error, don't retry other endpoints
          if (result.error.code === 400 || result.error.code === 401) {
            throw lastError;
          }
          continue; // Try next endpoint
        }
        
        // Check for success
        if (result && result.success === true) {
          const messageId = result.message_id || result.data?.messages?.[0]?.id || null;
          const waId = result.data?.contacts?.[0]?.wa_id || null;
          console.log(`✅ WhatsApp message sent successfully! Message ID: ${messageId}`);
          return { success: true, messageId, waId, data: result };
        }
        
        // Check for WhatsApp API direct format (if proxy returns it directly)
        if (result && result.messages && result.messages[0]?.id) {
          const messageId = result.messages[0].id;
          const waId = result.contacts?.[0]?.wa_id || null;
          console.log(`✅ WhatsApp message sent successfully! Message ID: ${messageId}`);
          return { success: true, messageId, waId, data: result };
        }
        
        // HTTP 200 but unclear format
        if (response.status === 200 && result && result.contacts && result.contacts[0]) {
          const messageId = result.messages?.[0]?.id || null;
          const waId = result.contacts[0].wa_id || null;
          console.log(`✅ WhatsApp message sent (HTTP 200 with contacts)`);
          return { success: true, messageId, waId, data: result };
        }
        
        console.warn('⚠️ Unexpected response format:', result);
        lastError = new Error('Unexpected response format');
        
      } catch (err) {
        console.error(`❌ Error on endpoint ${endpointIndex + 1}:`, err.message);
        
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }
        
        lastError = err;
        
        // If it's a network error (connection refused), try next endpoint
        if (err.code === 'ECONNREFUSED' || err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ERR_NETWORK') {
          console.log(`⚠️ Connection refused - proxy server not running`);
          // Continue to next endpoint
          continue;
        }
        
        // If it's a 404 or HTML error, try next endpoint
        if (err.response && (err.response.status === 404 || 
            (typeof err.response.data === 'string' && err.response.data.includes('<html')))) {
          console.log(`⚠️ 404/HTML error - trying next endpoint`);
          continue;
        }
      }
    }
    
    // All endpoints failed
    if (lastError && lastError.message === 'PROXY_SERVER_NOT_RUNNING') {
      const proxyError = new Error('PROXY_SERVER_REQUIRED');
      proxyError.details = 'Proxy server is not running. Please start it with: npm run server';
      throw proxyError;
    }
    
    throw lastError || new Error('Failed to send WhatsApp message - all endpoints failed');
  }, [getWhatsAppApiUrl]);

  const sendWhatsAppMessageAuto = useCallback(async (voter, targetNumber) => {
    try {
      // Clean and validate number
      let cleanNumber = targetNumber || voter['मोबाईल नं.'] || '';
      cleanNumber = cleanNumber.replace(/\D/g, ''); // Remove non-digits
      
      if (!cleanNumber || cleanNumber.length < 10) {
        console.error('❌ Invalid mobile number:', cleanNumber);
        return false;
      }
      
      // Remove leading 91 if present, then add it back (ensure format: 91XXXXXXXXXX)
      if (cleanNumber.startsWith('91')) {
        cleanNumber = cleanNumber.substring(2); // Remove 91
      }
      
      // Validate exactly 10 digits (after removing country code)
      if (!/^\d{10}$/.test(cleanNumber)) {
        console.error('❌ Mobile number must be 10 digits:', cleanNumber);
        return false;
      }
      
      // Always add country code 91 (format: 919090385555)
      cleanNumber = '91' + cleanNumber;
      
      // Prepare voter details for API
      const voterDetails = {
        serial_no: (voter['अनु क्र.'] && voter['अनु क्र.'].toString().trim()) || '',
        house_no: (voter['घर क्र.'] && voter['घर क्र.'].toString().trim()) || '',
        name_marathi: (voter['नाव (मराठी)'] && voter['नाव (मराठी)'].toString().trim()) || '',
        name_english: (voter['नाव (इंग्रजी)'] && voter['नाव (इंग्रजी)'].toString().trim()) || '',
        gender: (voter['लिंग (मराठी)'] && voter['लिंग (मराठी)'].toString().trim()) || (voter['लिंग (इंग्रजी)'] && voter['लिंग (इंग्रजी)'].toString().trim()) || '',
        age: (voter['वय'] && voter['वय'].toString().trim()) || '',
        epic_id: (voter['मतदान कार्ड क्र.'] && voter['मतदान कार्ड क्र.'].toString().trim()) || '',
        mobile: (voter['मोबाईल नं.'] && voter['मोबाईल नं.'].toString().trim()) || ''
      };
      
      // Format message from voter details
      const message = `📋 *मतदार माहिती*\n\n` +
        `🏷️ *अनु क्र.:* ${voterDetails.serial_no || '-'}\n` +
        `🏠 *घर क्र.:* ${voterDetails.house_no || '-'}\n` +
        `👤 *नाव (मराठी):* ${voterDetails.name_marathi || '-'}\n` +
        `👤 *नाव (इंग्रजी):* ${voterDetails.name_english || '-'}\n` +
        `⚧️ *लिंग:* ${voterDetails.gender || '-'}\n` +
        `🎂 *वय:* ${voterDetails.age || '-'}\n` +
        `🆔 *मतदान कार्ड क्र.:* ${voterDetails.epic_id || '-'}\n` +
        `📱 *मोबाइल नं.:* ${voterDetails.mobile || '-'}\n\n` +
        `Nana Walke Foundation`;
      
      // WhatsApp API Configuration - Use environment variables
      const phoneNumberId = process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '741032182432100';
      const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY || '798422d2-818f-11f0-98fc-02c8a5e042bd';
      
      console.log(`📤 Sending WhatsApp to ${voterDetails.name_english || voterDetails.name_marathi} (${cleanNumber})`);
      
      // Use unified core function
      const result = await sendWhatsAppMessageCore(cleanNumber, message, phoneNumberId, apiKey);
      
      if (result.success) {
        console.log(`✅ Successfully sent to ${voterDetails.name_english || voterDetails.name_marathi}`);
        return true;
      }
      
      return false;
      
    } catch (err) {
      console.error('❌ Auto-send WhatsApp error:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      return false;
    }
  }, [sendWhatsAppMessageCore]);

  // Auto-send WhatsApp messages when search results are displayed
  useEffect(() => {
    // Only auto-send if there are filtered voters and search query is set
    if (!searchQuery.trim() || filteredVoters.length === 0 || loading) {
      return;
    }

    // Auto-send to voters who have mobile numbers
    const autoSendToVoters = async () => {
      setAutoSendingWhatsApp(true);
      setAutoSentCount(0);
      
      let sentCount = 0;
      let failedCount = 0;
      let skippedCount = 0;

      console.log('📤 Starting auto-send WhatsApp for search results...');
      console.log(`📊 Total filtered voters: ${filteredVoters.length}`);

      // Send to voters with mobile numbers (limit to first 20 to avoid rate limiting)
      const votersWithMobile = filteredVoters
        .filter(voter => {
          const mobile = (voter['मोबाईल नं.'] || '').trim();
          const isValidMobile = mobile && mobile.length >= 10 && /^\d{10}$/.test(mobile);
          if (!isValidMobile) {
            skippedCount++;
          }
          return isValidMobile;
        })
        .slice(0, 20); // Limit to first 20 to avoid overwhelming

      console.log(`📱 Found ${votersWithMobile.length} voters with valid mobile numbers`);

      for (let i = 0; i < votersWithMobile.length; i++) {
        const voter = votersWithMobile[i];
        try {
          const mobile = (voter['मोबाईल नं.'] || '').trim();
          const name = voter['नाव (इंग्रजी)'] || voter['नाव (मराठी)'] || 'Unknown';
          
          console.log(`📤 Sending WhatsApp (${i + 1}/${votersWithMobile.length}) to ${name} - ${mobile}`);
          
          // Send WhatsApp message silently (without showing alerts)
          const success = await sendWhatsAppMessageAuto(voter, mobile);
          if (success) {
            sentCount++;
            setAutoSentCount(sentCount);
            console.log(`✅ Sent successfully to ${name}`);
          } else {
            failedCount++;
            console.log(`❌ Failed to send to ${name}`);
          }
          
          // Delay between messages to avoid rate limiting (2 seconds)
          if (i < votersWithMobile.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (err) {
          failedCount++;
          console.error(`❌ Auto-send error for voter ${voter['नाव (इंग्रजी)']}:`, err);
        }
      }

      setAutoSendingWhatsApp(false);
      
      // Show summary in console
      console.log(`\n📊 Auto-send Summary:`);
      console.log(`✅ Successfully sent: ${sentCount}`);
      console.log(`❌ Failed: ${failedCount}`);
      console.log(`⏭️  Skipped (no valid mobile): ${skippedCount}`);
      console.log(`📱 Total processed: ${sentCount + failedCount + skippedCount}`);
      
      // Show notification if messages were sent
      if (sentCount > 0) {
        console.log(`✅ Auto-sent WhatsApp messages to ${sentCount} voters successfully!`);
      }
    };

    // Delay auto-send by 2 seconds after search results are shown
    const timer = setTimeout(() => {
      autoSendToVoters();
    }, 2000);

    return () => clearTimeout(timer);
  }, [filteredVoters, searchQuery, loading, sendWhatsAppMessageAuto]);

  // Generate search suggestions based on input
  const generateSuggestions = useCallback((value) => {
    if (!value.trim() || value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchLower = value.toLowerCase().trim();
    const suggestionsList = [];

    // Search in all voters for matching names
    voters.forEach(voter => {
      const nameEn = (voter['नाव (इंग्रजी)'] || '').toLowerCase();
      const nameMr = (voter['नाव (मराठी)'] || '').toLowerCase();
      const epicId = (voter['मतदान कार्ड क्र.'] || '').toLowerCase().trim();
      const mobile = (voter['मोबाईल नं.'] || '').toLowerCase().trim();

      if (nameEn.includes(searchLower) || nameMr.includes(searchLower) || 
          epicId.includes(searchLower) || mobile.includes(searchLower)) {
        const suggestion = {
          nameEn: voter['नाव (इंग्रजी)'] || '',
          nameMr: voter['नाव (मराठी)'] || '',
          epicId: voter['मतदान कार्ड क्र.'] || '',
          mobile: voter['मोबाईल नं.'] || '',
          searchText: nameEn || nameMr || epicId || mobile
        };
        
        // Avoid duplicates
        if (!suggestionsList.some(s => s.searchText === suggestion.searchText)) {
          suggestionsList.push(suggestion);
        }
      }
    });

    // Limit to 10 suggestions
    setSuggestions(suggestionsList.slice(0, 10));
    setShowSuggestions(suggestionsList.length > 0);
  }, [voters]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If input is cleared (backspace), also clear search query to hide data
    if (!value.trim()) {
      setSearchQuery('');
      setShowSuggestions(false);
    } else {
      generateSuggestions(value);
    }
  }, [generateSuggestions]);

  // Handle search button click or Enter key
  const handleSearch = useCallback(() => {
    setSearchQuery(searchTerm);
    setCurrentPage(1);
    setShowSuggestions(false);
    
    // Save to search history if not empty
    if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
      setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 4)]);
    }
  }, [searchTerm, searchHistory]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    const searchValue = suggestion.nameEn || suggestion.nameMr || suggestion.epicId || suggestion.mobile;
    setSearchTerm(searchValue);
    setSearchQuery(searchValue);
    setCurrentPage(1);
    setShowSuggestions(false);
    
    if (searchValue.trim() && !searchHistory.includes(searchValue.trim())) {
      setSearchHistory(prev => [searchValue.trim(), ...prev.slice(0, 4)]);
    }
  }, [searchHistory]);

  // Handle Enter key press
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    alert('क्लिपबोर्डवर कॉपी केले!');
  }, []);

  // Start editing mobile number
  const startEditMobile = useCallback((voterId, currentMobile) => {
    setEditingMobile(voterId);
    setEditMobileValue(currentMobile || '');
  }, []);

  // Cancel editing mobile number
  const cancelEditMobile = useCallback(() => {
    setEditingMobile(null);
    setEditMobileValue('');
  }, []);

  // Save mobile number to localStorage
  // Update voter data directly in database (no localStorage)
  const updateVoterInDatabase = useCallback(async (epicId, mobile, address, serialNo, voterId) => {
    try {
      setSyncingToDatabase(true);
      
      // Validate epicId
      if (!epicId || !epicId.trim()) {
        console.error('❌ Invalid EPIC ID for database sync');
        return false;
      }
      
      // Validate mobile number format (if provided)
      if (mobile && mobile.trim() && !/^\d{10}$/.test(mobile.trim())) {
        console.error('❌ Invalid mobile number format:', mobile);
      return false;
    }
      
      // API endpoint - Vercel will proxy to https://xtend.online/Voter/update_mobile.php
      // This works in both development (via setupProxy) and production (via vercel.json rewrite)
      const apiUrl = '/api/Voter/update_mobile.php';
      
      console.log('📤 Syncing voter data to database:', {
        epicId,
        mobile: mobile || '(empty)',
        address: address || '(empty)',
        serialNo,
        apiUrl
      });
      
      const response = await axios.post(apiUrl, {
        voter_id: voterId,
        epic_id: epicId.trim(),
        mobile: (mobile || '').trim(),
        address: address ? address.trim() : null,
        house_number: address ? address.trim() : null,
        serial_no: serialNo,
      }, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false,
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all responses to handle errors properly
        }
      });

      console.log('📥 Database sync response:', response.status, response.data);
      
      // Check if response is HTML (error page)
      if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE') || response.data.includes('<html') || response.data.includes('Fatal error'))) {
        console.error('❌ API returned HTML instead of JSON');
        return false;
      }
      
      // Try to parse JSON if it's a string
      let result = response.data;
      if (typeof response.data === 'string') {
        try {
          result = JSON.parse(response.data);
        } catch (e) {
          console.error('❌ Failed to parse JSON response:', response.data.substring(0, 200));
          return false;
        }
      }
      
      if (result && result.status === 'success') {
        console.log('✅ Voter data updated in database successfully:', {
          epicId,
          mobile: mobile || '(removed)',
          address: address || '(unchanged)'
        });
        return true;
      } else {
        const errorMsg = result?.message || 'Database update failed';
        console.error('❌ Database sync failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      // Check for WordPress interference
      if (err.response?.data?.code === 'wp_die' || 
          err.response?.data?.message?.includes('database connection') ||
          err.response?.data?.message?.includes('Error establishing')) {
        console.error('❌ WordPress interference detected!', err.response?.data);
        return false;
      }
      
      // Check for network errors
      if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') {
        console.error('❌ Network error during database sync:', err.message);
        return false;
      }
      
      // Log all errors for debugging
      console.error('❌ Database sync error:', {
        code: err.code,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        epicId,
        mobile
      });
      
      return false;
    } finally {
      setSyncingToDatabase(false);
    }
  }, []);

  // No localStorage - all updates go directly to database

  // Update mobile number - directly to database (no localStorage)
  const updateMobileNumber = useCallback(async (voterId, newMobile) => {
    try {
      setUpdatingMobile(true);
      
      // Find the voter to get their data
      const voter = voters.find(v => v.id === voterId);
      if (!voter) {
        alert('वोटर सापडला नाही!');
        return;
      }
      
      const epicId = voter['मतदान कार्ड क्र.'];
      if (!epicId) {
        alert('EPIC ID सापडला नाही!');
        return;
      }
      
      // Update database FIRST (no localStorage)
      const updated = await updateVoterInDatabase(
            epicId,
        newMobile, 
        voter['घर क्र.'], 
            voter['अनु क्र.'],
        voterId
      );

      if (!updated) {
        alert('❌ Database में update नहीं हुआ!\n\n' +
              'कृपया:\n' +
              '1. API endpoint check करें\n' +
              '2. Database connection verify करें\n' +
              '3. Console में error देखें');
        return;
      }

      // Only update UI after successful database update
      setVoters(prevVoters => 
        prevVoters.map(v => 
          v.id === voterId 
            ? { ...v, 'मोबाईल नं.': newMobile || '' }
            : v
        )
      );
      
      setEditingMobile(null);
      setEditMobileValue('');
      
      // Show success message
      if (newMobile && newMobile.trim()) {
        alert('✅ मोबाइल नंबर database में अपडेट केला गेला!\n\n' +
              '📱 Number: ' + newMobile);
      } else {
        alert('✅ मोबाइल नंबर database से हटवला गेला!');
      }
      
    } catch (err) {
      console.error('Error updating mobile:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Database update failed';
      alert(`❌ त्रुटी: ${errorMsg}\n\nDatabase में update नहीं हुआ!`);
    } finally {
      setUpdatingMobile(false);
    }
  }, [voters, updateVoterInDatabase]);

  // Save mobile number
  const saveMobileNumber = useCallback((voterId) => {
    if (updatingMobile) {
      console.log('⚠️ Mobile update already in progress');
      return;
    }
    
    const trimmedValue = editMobileValue.trim();
    
    // Allow empty value to remove mobile number
    if (trimmedValue === '') {
      // Empty value is valid (to remove mobile number)
      updateMobileNumber(voterId, '');
      return;
    }
    
    // Basic validation - check if it's a valid mobile number (10 digits)
    if (!/^\d{10}$/.test(trimmedValue)) {
      alert('कृपया वैध 10 अंकी मोबाइल नंबर प्रविष्ट करा\n\n' +
            'उदाहरण: 9876543210');
      return;
    }
    
    // Additional validation - check if it starts with valid Indian mobile prefixes
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(trimmedValue[0])) {
      alert('⚠️ मोबाइल नंबर भारतीय format में नहीं है\n\n' +
            'कृपया 6, 7, 8, या 9 से शुरू होने वाला 10 अंकी नंबर डालें।');
      return;
    }
    
    updateMobileNumber(voterId, trimmedValue);
  }, [editMobileValue, updateMobileNumber, updatingMobile]);

  // Cancel editing address
  const cancelEditAddress = useCallback(() => {
    setEditingAddress(null);
    setEditAddressValue('');
  }, []);

  // Update address - directly to database (no localStorage)
  const updateAddress = useCallback(async (voterId, newAddress) => {
    try {
      setUpdatingAddress(true);
      
      // Find the voter to get their data
      const voter = voters.find(v => v.id === voterId);
      if (!voter) {
        alert('वोटर सापडला नाही!');
        return;
      }

      const epicId = voter['मतदान कार्ड क्र.'];
      if (!epicId) {
        alert('EPIC ID सापडला नाही!');
        return;
      }

      // Update database FIRST (no localStorage)
      const updated = await updateVoterInDatabase(
        epicId, 
        voter['मोबाईल नं.'], 
        newAddress, 
        voter['अनु क्र.'], 
        voterId
      );

      if (!updated) {
        alert('❌ Database में update नहीं हुआ!\n\n' +
              'कृपया:\n' +
              '1. API endpoint check करें\n' +
              '2. Database connection verify करें\n' +
              '3. Console में error देखें');
        return;
      }

      // Only update UI after successful database update
      setVoters(prevVoters => 
        prevVoters.map(v => 
          v.id === voterId 
            ? { ...v, 'घर क्र.': newAddress || '' }
            : v
        )
      );
      
      setEditingAddress(null);
      setEditAddressValue('');
      
      // Show success message
      if (newAddress && newAddress.trim()) {
        alert('✅ घर क्र. database में अपडेट केला गेला!\n\n' +
              '🏠 Address: ' + newAddress);
          } else {
        alert('✅ घर क्र. database से हटवला गेला!');
      }

    } catch (err) {
      console.error('Error updating address:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Database update failed';
      alert(`❌ त्रुटी: ${errorMsg}\n\nDatabase में update नहीं हुआ!`);
    } finally {
      setUpdatingAddress(false);
    }
  }, [voters, updateVoterInDatabase]);

  // Save address
  const saveAddress = useCallback((voterId) => {
    if (updatingAddress) {
      console.log('⚠️ Address update already in progress');
      return;
    }
    
    const trimmedValue = editAddressValue.trim();
    updateAddress(voterId, trimmedValue);
  }, [editAddressValue, updateAddress, updatingAddress]);

  // Format voter details for WhatsApp message (not currently used, kept for reference)
  // eslint-disable-next-line no-unused-vars
  const formatVoterDetails = useCallback((voter) => {
    return [
      '📋 *मतदार माहिती*',
      '',
      `🏷️ *अनु क्र.:* ${voter['अनु क्र.'] || '-'}`,
      `🏠 *घर क्र.:* ${voter['घर क्र.'] || '-'}`,
      `👤 *नाव (मराठी):* ${voter['नाव (मराठी)'] || '-'}`,
      `👤 *नाव (इंग्रजी):* ${voter['नाव (इंग्रजी)'] || '-'}`,
      `⚧️ *लिंग:* ${voter['लिंग (मराठी)'] || voter['लिंग (इंग्रजी)'] || '-'}`,
      `🎂 *वय:* ${voter['वय'] || '-'}`,
      `🆔 *मतदान कार्ड क्र.:* ${voter['मतदान कार्ड क्र.'] || '-'}`,
      `📱 *मोबाइल नं.:* ${voter['मोबाईल नं.'] || '-'}`,
      ''
    ].join('\n');
  }, []);

  // Send WhatsApp message using API (for manual send from modal)
  const sendWhatsAppMessage = useCallback(async (voter, targetNumber = null) => {
    try {
      setSendingWhatsApp(true);
      
      // Clean and validate number
      let cleanNumber = targetNumber || voter['मोबाईल नं.'] || '';
      cleanNumber = cleanNumber.replace(/\D/g, ''); // Remove non-digits
      
      if (!cleanNumber || cleanNumber.length < 10) {
        alert('❌ कृपया वैध 10 अंकी नंबर प्रविष्ट करा\n\nउदाहरण: 9090385555');
        setSendingWhatsApp(false);
        return;
      }
      
      // Remove leading 91 if present, then add it back (ensure format: 91XXXXXXXXXX)
      if (cleanNumber.startsWith('91')) {
        cleanNumber = cleanNumber.substring(2); // Remove 91
      }
      
      // Validate exactly 10 digits (after removing country code)
      if (!/^\d{10}$/.test(cleanNumber)) {
        alert('❌ मोबाइल नंबर exactly 10 digits होना चाहिए\n\nउदाहरण: 9090385555');
        setSendingWhatsApp(false);
        return;
      }
      
      // Always add country code 91 (format: 919090385555)
      cleanNumber = '91' + cleanNumber;
      
      // Prepare voter details for API - extract all data properly
      const voterDetails = {
        serial_no: (voter['अनु क्र.'] && voter['अनु क्र.'].toString().trim()) || '',
        house_no: (voter['घर क्र.'] && voter['घर क्र.'].toString().trim()) || '',
        name_marathi: (voter['नाव (मराठी)'] && voter['नाव (मराठी)'].toString().trim()) || '',
        name_english: (voter['नाव (इंग्रजी)'] && voter['नाव (इंग्रजी)'].toString().trim()) || '',
        gender: (voter['लिंग (मराठी)'] && voter['लिंग (मराठी)'].toString().trim()) || (voter['लिंग (इंग्रजी)'] && voter['लिंग (इंग्रजी)'].toString().trim()) || '',
        age: (voter['वय'] && voter['वय'].toString().trim()) || '',
        epic_id: (voter['मतदान कार्ड क्र.'] && voter['मतदान कार्ड क्र.'].toString().trim()) || '',
        mobile: (voter['मोबाईल नं.'] && voter['मोबाईल नं.'].toString().trim()) || ''
      };
      
      // Format message from voter details (exactly as per user's example)
      const message = `📋 *मतदार माहिती*\n\n` +
        `🏷️ *अनु क्र.:* ${voterDetails.serial_no || '-'}\n` +
        `🏠 *घर क्र.:* ${voterDetails.house_no || '-'}\n` +
        `👤 *नाव (मराठी):* ${voterDetails.name_marathi || '-'}\n` +
        `👤 *नाव (इंग्रजी):* ${voterDetails.name_english || '-'}\n` +
        `⚧️ *लिंग:* ${voterDetails.gender || '-'}\n` +
        `🎂 *वय:* ${voterDetails.age || '-'}\n` +
        `🆔 *मतदान कार्ड क्र.:* ${voterDetails.epic_id || '-'}\n` +
        `📱 *मोबाइल नं.:* ${voterDetails.mobile || '-'}\n\n` +
        `Nana Walke Foundation`;
      
      // WhatsApp API Configuration - Use environment variables
      const phoneNumberId = process.env.REACT_APP_WHATSAPP_PHONE_NUMBER_ID || '741032182432100';
      const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY || '798422d2-818f-11f0-98fc-02c8a5e042bd';
      
      console.log('📤 Sending WhatsApp message:');
      console.log('  - Phone Number:', cleanNumber, '(format: 91XXXXXXXXXX)');
      console.log('  - Voter:', voterDetails.name_english || voterDetails.name_marathi);
      console.log('  - Message Preview:', message.substring(0, 150) + '...');
      
      // Use unified core function with retry logic
      const result = await sendWhatsAppMessageCore(cleanNumber, message, phoneNumberId, apiKey, 3);
      
      if (result.success) {
        const messageId = result.messageId || 'N/A';
        const waId = result.waId || null;
        const contactExists = waId !== null;
        
        console.log('✅ WhatsApp message sent successfully!');
        console.log('  - Message ID:', messageId);
        console.log('  - Sent to:', cleanNumber);
        console.log('  - WA ID:', waId || 'Not found');
        console.log('  - Contact registered on WhatsApp:', contactExists);
        
        let successMessage = '✅ WhatsApp message यशस्वीरित्या भेजला गेला!\n\n' + 
              `📱 Number: ${cleanNumber}\n` +
              `👤 Voter: ${voterDetails.name_english || voterDetails.name_marathi}\n`;
        
        if (messageId && messageId !== 'N/A') {
          successMessage += `📋 Message ID: ${messageId}\n\n`;
        }
        
        if (contactExists) {
          successMessage += '✅ Contact WhatsApp पर registered है\n\n';
        } else {
          successMessage += '⚠️ Note: Contact WhatsApp पर register होना चाहिए\n\n';
        }
        
        successMessage += '✅ Message WhatsApp servers को successfully send हुआ!\n\n';
        successMessage += '📝 **Important Notes:**\n\n';
        successMessage += '⚠️ **24-Hour Window:**\n';
        successMessage += '• Free-form messages केवल उन users को भेजे जा सकते हैं\n';
        successMessage += '  जिन्होंने आपको last 24 घंटे में message किया हो\n\n';
        successMessage += '📋 **Template Messages:**\n';
        successMessage += '• First-time conversations के लिए approved templates जरूरी हैं\n';
        successMessage += '• अगर user ने आपको पहले message नहीं किया, तो template use करें\n\n';
        successMessage += '💡 **Testing Tips:**\n';
        successMessage += '1. उस number से test करें जिसने आपको recently message किया हो\n';
        successMessage += '2. WhatsApp Business Manager में delivery status check करें\n';
        successMessage += '3. अगर message नहीं दिखे, तो 24-hour window या template issue हो सकता है';
        
        alert(successMessage);
        
        // Reset input if used
        if (targetNumber) {
          setWhatsappNumber('');
          setShowWhatsAppInput(false);
        }
          return true;
      } else {
        throw new Error('Failed to send WhatsApp message');
      }
      
    } catch (err) {
      console.error('❌ Error sending WhatsApp message:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // User-friendly error messages in Hindi
      let errorMsg = '❌ WhatsApp message भेजने में समस्या आई\n\n';
      
      // Check for proxy server not running error
      if (err.message === 'PROXY_SERVER_REQUIRED' || 
          err.message.includes('PROXY_SERVER_NOT_RUNNING') ||
          err.message.includes('HTML error page') ||
          (err.response && typeof err.response.data === 'string' && err.response.data.includes('Cannot POST'))) {
        errorMsg += '⚠️ **Proxy Server नहीं चल रहा है!**\n\n';
        errorMsg += 'समस्या:\n';
        errorMsg += '• Proxy server (port 3001) चल नहीं रहा\n';
        errorMsg += '• Browser से directly WhatsApp API call नहीं हो सकता (CORS issue)\n\n';
        errorMsg += '✅ **समाधान:**\n\n';
        errorMsg += '**Option 1: Proxy Server Start करें**\n';
        errorMsg += '1. नया terminal window खोलें\n';
        errorMsg += '2. Run करें: `cd /Users/ashishpimple/Desktop/Voter-Search-App`\n';
        errorMsg += '3. Run करें: `npm run server`\n';
        errorMsg += '4. Wait करें: "🚀 WhatsApp API Proxy Server running..." message\n';
        errorMsg += '5. इस terminal को open रखें\n';
        errorMsg += '6. फिर से message भेजने की कोशिश करें\n\n';
        errorMsg += '**Option 2: दोनों एक साथ Start करें**\n';
        errorMsg += '1. सभी terminals बंद करें (Ctrl+C)\n';
        errorMsg += '2. Run करें: `npm run dev`\n';
        errorMsg += '3. यह proxy server और React app दोनों start करेगा\n\n';
        errorMsg += '💡 **Note:** Proxy server बिना WhatsApp messages नहीं भेजे जा सकते!\n';
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_CONNECTION_REFUSED') {
        errorMsg += 'समस्या:\n' +
          '• Proxy server (port 3001) चल नहीं रहा\n\n' +
          'समाधान:\n' +
          '1. ✅ नया terminal खोलें\n' +
          '2. ✅ Run करें: `npm run server`\n' +
          '3. ✅ Wait करें: "🚀 WhatsApp API Proxy Server running..." message\n' +
          '4. ✅ फिर से try करें\n\n';
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('CORS')) {
        errorMsg += '⚠️ **CORS Error - Proxy Server जरूरी है!**\n\n';
        errorMsg += 'समस्या:\n' +
          '• Browser से directly WhatsApp API call नहीं हो सकता\n' +
          '• CORS policy block कर रही है\n\n' +
          'समाधान:\n' +
          '1. ✅ Proxy server start करें: `npm run server`\n' +
          '2. ✅ Proxy server terminal को open रखें\n' +
          '3. ✅ फिर से try करें\n\n';
      } else if (err.response && err.response.status === 404) {
        errorMsg += 'समस्या:\n' +
          '• API endpoint नहीं मिल रहा है\n' +
          '• Proxy server नहीं चल रहा\n\n' +
          'समाधान:\n' +
          '1. ✅ Proxy server start करें: `npm run server`\n' +
          '2. ✅ Browser console (F12) में network tab देखें\n\n';
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        errorMsg += 'समस्या:\n' +
          '• Request timeout हो गया\n' +
          '• WhatsApp API response नहीं दे रहा\n\n' +
          'समाधान:\n' +
          '1. ✅ Internet connection check करें\n' +
          '2. ✅ कुछ समय बाद फिर से try करें\n\n';
      } else {
        errorMsg += 'समस्या:\n' +
          '• ' + (err.response?.data?.message || err.message || 'Unknown error') + '\n\n' +
          'समाधान:\n' +
          '1. ✅ API credentials verify करें\n' +
          '2. ✅ Phone Number ID check करें\n' +
          '3. ✅ Browser console (F12) में detailed error देखें\n\n';
      }
      
      errorMsg += 'Error: ' + (err.response?.data?.message || err.message || 'Unknown error');
      
      alert(errorMsg);
      return false;
      
    } finally {
      setSendingWhatsApp(false);
    }
  }, [sendWhatsAppMessageCore]);

  // Share voter details on WhatsApp - show input modal
  const shareOnWhatsApp = useCallback((voter) => {
    // Show input modal for WhatsApp number
    setShowWhatsAppInput(true);
    // Store voter for later use
    const voterData = voters.find(v => v.id === voter.id) || voter;
    setSelectedVoter(voterData);
  }, [voters]);

  // Handle WhatsApp number input and send
  const handleWhatsAppSend = useCallback(() => {
    if (!whatsappNumber.trim()) {
      alert('❌ कृपया WhatsApp नंबर प्रविष्ट करा\n\nउदाहरण: 9876543210');
      return;
    }

    // Find selected voter
    const voter = typeof selectedVoter === 'object' ? selectedVoter : voters.find(v => v.id === selectedVoter);
    
    if (!voter) {
      alert('❌ वोटर डेटा सापडला नाही\n\nकृपया पहले voter select करें।');
      return;
    }

    // Validate number - clean it first
    let cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    // Remove leading 91 if present, then validate 10 digits
    if (cleanNumber.startsWith('91')) {
      cleanNumber = cleanNumber.substring(2); // Remove 91
    }
    
    if (cleanNumber.length !== 10) {
      alert('❌ कृपया वैध 10 अंकी नंबर प्रविष्ट करा\n\nउदाहरण: 9090385555');
      return;
    }

    // Validate Indian mobile format (starts with 6, 7, 8, or 9)
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(cleanNumber[0])) {
      alert('⚠️ मोबाइल नंबर भारतीय format में नहीं है\n\n' +
            'कृपया 6, 7, 8, या 9 से शुरू होने वाला 10 अंकी नंबर डालें।');
      return;
    }

    // Always add country code 91 (format: 919090385555)
    cleanNumber = '91' + cleanNumber;

    console.log('📤 Sending WhatsApp via modal for voter:', voter['नाव (इंग्रजी)'] || voter['नाव (मराठी)']);
    console.log('📱 Target number:', cleanNumber, '(format: 91XXXXXXXXXX)');
    
    // Send message (sendWhatsAppMessage will handle it correctly)
    sendWhatsAppMessage(voter, cleanNumber);
  }, [whatsappNumber, selectedVoter, voters, sendWhatsAppMessage]);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div style={{position: 'relative', zIndex: 1}}>
            <h1>🗳️ मतदार शोध प्रणाली</h1>
            <p className="subtitle">अधिकृत मतदार माहिती शोध प्रणाली</p>
          </div>
        </header>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-box-wrapper">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="नाव, मतदान कार्ड क्र., मोबाइल नंबर, अनु क्र., घर क्र. किंवा वयाने शोधा..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay to allow suggestion click
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                autoFocus
              />
              {searchTerm && (
                <button className="clear-btn" onClick={clearSearch} title="साफ करा">
                  ✕
                </button>
              )}
              <button 
                className="search-btn" 
                onClick={handleSearch}
                title="शोधा"
                disabled={loading}
              >
                🔍 शोधा
              </button>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="suggestion-name">
                      <strong>{suggestion.nameEn || suggestion.nameMr}</strong>
                      {suggestion.nameMr && suggestion.nameEn && (
                        <span className="suggestion-name-alt"> ({suggestion.nameMr})</span>
                      )}
                    </div>
                    <div className="suggestion-details">
                      {suggestion.epicId && (
                        <span className="suggestion-epic">मतदान कार्ड: {suggestion.epicId}</span>
                      )}
                      {suggestion.mobile && (
                        <span className="suggestion-mobile">मोबाईल: {suggestion.mobile}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Search Info */}
          {searchQuery && (
            <div className="search-info">
              <span>
                {filteredVoters.length === 0 
                  ? 'कोणतेही परिणाम सापडले नाही' 
                  : `${filteredVoters.length} परिणाम सापडले`}
              </span>
              {searchQuery && (
                <span className="search-query-display">
                  शोध: "{searchQuery}"
                  {filteredVoters.length > 0 && (
                    <span className="search-success"> ✓</span>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-card male">
            <div className="stat-icon">👨</div>
            <div className="stat-info">
              <div className="stat-label">पुरुष</div>
              <div className="stat-value">{genderStats.males.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card female">
            <div className="stat-icon">👩</div>
            <div className="stat-info">
              <div className="stat-label">महिला</div>
              <div className="stat-value">{genderStats.females.toLocaleString()}</div>
            </div>
          </div>
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <div className="stat-label">कुल</div>
              <div className="stat-value">{genderStats.total.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Small Sync Loading Indicator */}
        {syncingToDatabase && (
          <div className="sync-loading-small">
            <span className="sync-spinner-small">🔄</span>
            <span className="sync-text-small">Database मध्ये sync होत आहे...</span>
          </div>
        )}

        {/* Auto-send WhatsApp Status Indicator */}
        {autoSendingWhatsApp && (
          <div className="sync-loading-small" style={{background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', color: 'white'}}>
            <span className="sync-spinner-small">📱</span>
            <span className="sync-text-small">
              WhatsApp messages भेजत आहे... ({autoSentCount} sent)
            </span>
          </div>
        )}

        {/* WhatsApp Number Input Modal */}
        {showWhatsAppInput && (() => {
          const currentVoter = typeof selectedVoter === 'object' ? selectedVoter : voters.find(v => v.id === selectedVoter);
          return (
          <div className="whatsapp-modal-overlay" onClick={() => setShowWhatsAppInput(false)}>
            <div className="whatsapp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="whatsapp-modal-header">
                <h3>📱 WhatsApp Message भेजा</h3>
                <button 
                  className="whatsapp-modal-close"
                  onClick={() => {
                    setShowWhatsAppInput(false);
                    setWhatsappNumber('');
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="whatsapp-modal-body">
                  {/* Voter Information Display */}
                  {currentVoter && (
                    <div className="whatsapp-voter-info">
                      <p className="whatsapp-modal-info">
                        <strong>मतदार माहिती:</strong>
                      </p>
                      <div className="whatsapp-voter-details">
                        <p><strong>नाव:</strong> {currentVoter['नाव (मराठी)'] || currentVoter['नाव (इंग्रजी)'] || '-'}</p>
                        <p><strong>मतदान कार्ड क्र.:</strong> {currentVoter['मतदान कार्ड क्र.'] || '-'}</p>
                        <p><strong>अनु क्र.:</strong> {currentVoter['अनु क्र.'] || '-'}</p>
                        {currentVoter['मोबाईल नं.'] && currentVoter['मोबाईल नं.'].trim() && (
                          <p><strong>मोबाइल नं.:</strong> {currentVoter['मोबाईल नं.']}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                <p className="whatsapp-modal-info">
                  WhatsApp नंबर प्रविष्ट करा (10 अंकी)
                </p>
                <input
                  type="tel"
                  className="whatsapp-number-input"
                  placeholder="9876543210"
                  value={whatsappNumber}
                    onChange={(e) => {
                      // Only allow digits, max 10
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setWhatsappNumber(value);
                    }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleWhatsAppSend();
                    }
                  }}
                    maxLength="10"
                  autoFocus
                />
                  {currentVoter && currentVoter['मोबाईल नं.'] && currentVoter['मोबाईल नं.'].trim() && (
                    <button
                      className="whatsapp-use-existing"
                      onClick={() => {
                        const existingMobile = currentVoter['मोबाईल नं.'].replace(/\D/g, '').slice(0, 10);
                        setWhatsappNumber(existingMobile);
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        fontSize: '0.85rem',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      📱 मौजूदा मोबाइल नंबर use करें: {currentVoter['मोबाईल नं.'].trim()}
                    </button>
                  )}
                <div className="whatsapp-modal-buttons">
                  <button 
                    className="whatsapp-modal-btn whatsapp-modal-cancel"
                    onClick={() => {
                      setShowWhatsAppInput(false);
                      setWhatsappNumber('');
                    }}
                  >
                    रद्द करा
                  </button>
                  <button 
                    className="whatsapp-modal-btn whatsapp-modal-send"
                    onClick={handleWhatsAppSend}
                      disabled={!whatsappNumber.trim() || sendingWhatsApp || whatsappNumber.replace(/\D/g, '').length !== 10}
                  >
                    {sendingWhatsApp ? '⏳ भेजत आहे...' : '📱 WhatsApp वर भेजा'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Loading State */}
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>डेटा लोड होत आहे... कृपया प्रतीक्षा करा</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchVoterData} className="retry-btn">
              🔄 पुनः प्रयास करें
            </button>
          </div>
        )}

        {/* Results Section */}
        {!loading && !error && (
          <div className="results-section">
            {!searchQuery.trim() ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>शोध सुरू करा</p>
                <p className="no-results-hint">नाव, मतदान कार्ड क्र., मोबाइल नंबर किंवा इतर माहितीद्वारे शोधा</p>
              </div>
            ) : filteredVoters.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>कोणतेही परिणाम सापडले नाही</p>
                <p className="no-results-hint">कृपया वेगळी कीवर्ड वापरून शोधा</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-wrapper desktop-view">
                  <table className="voter-table">
                    <thead>
                      <tr>
                        <th>अनु क्र.</th>
                        <th>घर क्र.</th>
                        <th>नाव (मराठी)</th>
                        <th>नाव (इंग्रजी)</th>
                        <th>लिंग</th>
                        <th>वय</th>
                        <th>मतदान कार्ड क्र.</th>
                        <th>मोबाइल नं.</th>
                        <th>कृती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedVoters.map((voter, index) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                        return (
                          <tr 
                            key={`${voter.id || index}-${globalIndex}`}
                            className={selectedVoter === voter.id ? 'selected-row' : ''}
                            onClick={() => setSelectedVoter(voter.id)}
                          >
                            <td>{voter['अनु क्र.'] || '-'}</td>
                            <td className="address-cell">
                              {editingAddress === voter.id ? (
                                <div className="address-edit-container">
                                  <input
                                    type="text"
                                    className="address-edit-input"
                                    value={editAddressValue}
                                    onChange={(e) => setEditAddressValue(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        saveAddress(voter.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditAddress();
                                      }
                                    }}
                                    placeholder="घर क्र."
                                    disabled={updatingAddress}
                                    autoFocus
                                  />
                                  <div className="address-edit-buttons">
                                    <button
                                      className="address-save-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveAddress(voter.id);
                                      }}
                                      disabled={updatingAddress}
                                      title="सेव करा"
                                    >
                                      {updatingAddress ? '⏳' : '✓'}
                                    </button>
                                    <button
                                      className="address-cancel-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEditAddress();
                                      }}
                                      disabled={updatingAddress}
                                      title="रद्द करा"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <span 
                                  className="address-value clickable"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingAddress(voter.id);
                                    setEditAddressValue(voter['घर क्र.'] || '');
                                  }}
                                  title="घर क्र. edit करण्यासाठी क्लिक करा"
                                >
                                  {voter['घर क्र.'] || '-'}
                                </span>
                              )}
                            </td>
                            <td className="name-cell">{voter['नाव (मराठी)'] || '-'}</td>
                            <td className="name-cell">{voter['नाव (इंग्रजी)'] || '-'}</td>
                            <td>
                              <span className={`gender-badge ${voter['लिंग (इंग्रजी)'] === 'Male' ? 'male' : 'female'}`}>
                                {voter['लिंग (मराठी)'] || voter['लिंग (इंग्रजी)'] || '-'}
                              </span>
                            </td>
                            <td>{voter['वय'] || '-'}</td>
                            <td 
                              className="epic-id clickable"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(voter['मतदान कार्ड क्र.'] || '');
                              }}
                              title="मतदान कार्ड कॉपी करण्यासाठी क्लिक करा"
                            >
                              {voter['मतदान कार्ड क्र.'] || '-'}
                            </td>
                            <td className="mobile-cell">
                              {editingMobile === voter.id ? (
                                <div className="mobile-edit-container">
                                  <input
                                    type="text"
                                    className="mobile-edit-input"
                                    value={editMobileValue}
                                    onChange={(e) => setEditMobileValue(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        saveMobileNumber(voter.id);
                                      } else if (e.key === 'Escape') {
                                        cancelEditMobile();
                                      }
                                    }}
                                    placeholder="मोबाइल नंबर"
                                    maxLength="10"
                                    disabled={updatingMobile}
                                    autoFocus
                                  />
                                  <div className="mobile-edit-buttons">
                                    <button
                                      className="mobile-save-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        saveMobileNumber(voter.id);
                                      }}
                                      disabled={updatingMobile}
                                      title="सेव करा"
                                    >
                                      {updatingMobile ? '⏳' : '✓'}
                                    </button>
                                    <button
                                      className="mobile-cancel-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelEditMobile();
                                      }}
                                      disabled={updatingMobile}
                                      title="रद्द करा"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mobile-display-container">
                                  <span 
                                    className="mobile-value clickable"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(voter['मोबाईल नं.'] || '');
                                    }}
                                    title="मोबाईल कॉपी करण्यासाठी क्लिक करा"
                                  >
                                    {voter['मोबाईल नं.'] || '-'}
                                  </span>
                                  <button
                                    className="mobile-edit-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditMobile(voter.id, voter['मोबाईल नं.']);
                                    }}
                                    title="संपादित करा"
                                  >
                                    ✏️
                                  </button>
                                </div>
                              )}
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button 
                                  className="action-btn whatsapp-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    shareOnWhatsApp(voter);
                                  }}
                                  title="WhatsApp वर share करा"
                                >
                                  📱 WhatsApp
                                </button>
                                <button 
                                  className="action-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVoter(voter.id);
                                  }}
                                  title="तपशील पहा"
                                >
                                  👁️ पहा
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="mobile-card-view">
                  {paginatedVoters.map((voter, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div 
                        key={`mobile-${voter.id || index}-${globalIndex}`}
                        className={`voter-card ${selectedVoter === voter.id ? 'selected-card' : ''}`}
                        onClick={() => setSelectedVoter(voter.id)}
                      >
                        <div className="card-header">
                          <div className="card-serial">{voter['अनु क्र.'] || '-'}</div>
                          <span className={`gender-badge ${voter['लिंग (इंग्रजी)'] === 'Male' ? 'male' : 'female'}`}>
                            {voter['लिंग (मराठी)'] || voter['लिंग (इंग्रजी)'] || '-'}
                          </span>
                        </div>
                        
                        <div className="card-body">
                          <div className="card-row">
                            <span className="card-label">नाव (मराठी):</span>
                            <span className="card-value">{voter['नाव (मराठी)'] || '-'}</span>
                          </div>
                          
                          <div className="card-row">
                            <span className="card-label">नाव (इंग्रजी):</span>
                            <span className="card-value">{voter['नाव (इंग्रजी)'] || '-'}</span>
                          </div>
                          
                          <div className="card-row">
                            <span className="card-label">वय:</span>
                            <span className="card-value">{voter['वय'] || '-'}</span>
                          </div>
                          
                          <div className="card-row clickable-row"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (editingAddress === voter.id) {
                                return;
                              }
                              setEditingAddress(voter.id);
                              setEditAddressValue(voter['घर क्र.'] || '');
                            }}
                          >
                            <span className="card-label">घर क्र.:</span>
                            {editingAddress === voter.id ? (
                              <div className="card-edit-container">
                                <input
                                  type="text"
                                  className="card-edit-input"
                                  value={editAddressValue}
                                  onChange={(e) => setEditAddressValue(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      saveAddress(voter.id);
                                    } else if (e.key === 'Escape') {
                                      cancelEditAddress();
                                    }
                                  }}
                                  placeholder="घर क्र."
                                  disabled={updatingAddress}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="card-edit-buttons">
                                  <button
                                    className="card-save-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveAddress(voter.id);
                                    }}
                                    disabled={updatingAddress}
                                    title="सेव करा"
                                  >
                                    {updatingAddress ? '⏳' : '✓'}
                                  </button>
                                  <button
                                    className="card-cancel-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelEditAddress();
                                    }}
                                    disabled={updatingAddress}
                                    title="रद्द करा"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                            <span className="card-value">{voter['घर क्र.'] || '-'}</span>
                            )}
                          </div>
                          
                          <div className="card-row clickable-row"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(voter['मतदान कार्ड क्र.'] || '');
                            }}
                          >
                            <span className="card-label">मतदान कार्ड क्र.:</span>
                            <span className="card-value epic-id">{voter['मतदान कार्ड क्र.'] || '-'}</span>
                            <span className="copy-icon">📋</span>
                          </div>
                          
                          <div className="card-row">
                            <span className="card-label">मोबाइल नं.:</span>
                            {editingMobile === voter.id ? (
                              <div className="mobile-edit-container-mobile">
                                <input
                                  type="text"
                                  className="mobile-edit-input-mobile"
                                  value={editMobileValue}
                                  onChange={(e) => setEditMobileValue(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      saveMobileNumber(voter.id);
                                    } else if (e.key === 'Escape') {
                                      cancelEditMobile();
                                    }
                                  }}
                                  placeholder="मोबाइल नंबर"
                                  maxLength="10"
                                  disabled={updatingMobile}
                                  autoFocus
                                />
                                <div className="mobile-edit-buttons-mobile">
                                  <button
                                    className="mobile-save-btn-mobile"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveMobileNumber(voter.id);
                                    }}
                                    disabled={updatingMobile}
                                    title="सेव करा"
                                  >
                                    {updatingMobile ? '⏳' : '✓'}
                                  </button>
                                  <button
                                    className="mobile-cancel-btn-mobile"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelEditMobile();
                                    }}
                                    disabled={updatingMobile}
                                    title="रद्द करा"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mobile-display-container-mobile">
                                <span 
                                  className="card-value mobile-cell clickable-row"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(voter['मोबाईल नं.'] || '');
                                  }}
                                >
                                  {voter['मोबाईल नं.'] || '-'}
                                </span>
                                <button
                                  className="mobile-edit-btn-mobile"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditMobile(voter.id, voter['मोबाईल नं.']);
                                  }}
                                  title="संपादित करा"
                                >
                                  ✏️
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* WhatsApp Share Button for Mobile */}
                          <div className="card-actions">
                            <button 
                              className="whatsapp-btn-mobile"
                              onClick={(e) => {
                                e.stopPropagation();
                                shareOnWhatsApp(voter);
                              }}
                              title="WhatsApp वर share करा"
                            >
                              📱 WhatsApp वर Share करा
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items Per Page & Pagination */}
                <div className="pagination-controls">
                  <div className="items-per-page">
                    <label>प्रति पृष्ठ आयटम: </label>
                    <select 
                      value={itemsPerPage} 
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="items-select"
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                      <option value={filteredVoters.length}>सर्व ({filteredVoters.length})</option>
                    </select>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="page-btn"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      ← मागील
                    </button>
                    
                    <div className="page-info">
                      पृष्ठ {currentPage} पैकी {totalPages}
                      <span className="page-details">
                        (दाखवत आहे {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredVoters.length)} पैकी {filteredVoters.length})
                      </span>
                    </div>
                    
                    <button 
                      className="page-btn"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      पुढील →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
