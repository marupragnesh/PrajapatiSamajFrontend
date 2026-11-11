/**
 * Complete Indian States and Cities Dataset
 * Provides rich offline list for searchable cascading State -> City dropdowns
 */

export const INDIAN_STATES = [
  'Gujarat',
  'Maharashtra',
  'Rajasthan',
  'Madhya Pradesh',
  'Delhi',
  'Karnataka',
  'Uttar Pradesh',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Kerala',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const CITIES_BY_STATE = {
  Gujarat: [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
    'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch',
    'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Veraval',
    'Godhra', 'Patan', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur', 'Kalol', 'Kadi',
    'Modasa', 'Himmatnagar', 'Anjar', 'Gandhidham', 'Mandvi', 'Mahuva', 'Una',
    'Keshod', 'Dhoraji', 'Upleta', 'Wankaner', 'Visnagar', 'Unjha', 'Chhota Udaipur',
    'Vyara', 'Bardoli', 'Bilimora', 'Sanand', 'Halol', 'Khambhat'
  ],
  Maharashtra: [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Aurangabad (Chhatrapati Sambhajinagar)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar',
    'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Panvel', 'Ulhasnagar',
    'Sangli', 'Malegaon', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur',
    'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal', 'Satara', 'Beed', 'Yavatmal'
  ],
  Rajasthan: [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar',
    'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Barmer', 'Chittorgarh', 'Jhunjhunu',
    'Kishangarh', 'Beawar', 'Hanumangarh', 'Dholpur', 'Sawai Madhopur', 'Churu',
    'Tonk', 'Mount Abu', 'Jaisalmer', 'Nagaur', 'Banswara', 'Sirohi', 'Jalore'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Bhind',
    'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch'
  ],
  Delhi: [
    'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi',
    'North East Delhi', 'North West Delhi', 'South East Delhi', 'South West Delhi', 'Shahdara'
  ],
  Karnataka: [
    'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi',
    'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru', 'Raichur', 'Bidar',
    'Hosapete', 'Gadag-Betageri', 'Udupi', 'Chitradurga', 'Kolar', 'Mandya', 'Hassan'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj (Allahabad)',
    'Noida', 'Greater Noida', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur',
    'Faizabad (Ayodhya)', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun',
    'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
    'Tirupati', 'Kakinada', 'Kadapa', 'Anantapur', 'Eluru', 'Ongole', 'Vizianagaram'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Along', 'Tezu'
  ],
  Assam: [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon'
  ],
  Bihar: [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar'
  ],
  Chhattisgarh: [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Durg', 'Jagdalpur', 'Ambikapur'
  ],
  Goa: [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem'
  ],
  Haryana: [
    'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar',
    'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi', 'Kullu', 'Manali', 'Hamirpur'
  ],
  Jharkhand: [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih'
  ],
  Kerala: [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Palakkad', 'Malappuram'
  ],
  Manipur: [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Ukhrul'
  ],
  Meghalaya: [
    'Shillong', 'Tura', 'Jowai', 'Nongpoh', 'Cherrapunji'
  ],
  Mizoram: [
    'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Kolasib'
  ],
  Nagaland: [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha'
  ],
  Odisha: [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada'
  ],
  Punjab: [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur', 'Batala', 'Pathankot'
  ],
  Sikkim: [
    'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode',
    'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur', 'Nagercoil'
  ],
  Telangana: [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad'
  ],
  Tripura: [
    'Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar', 'Belonia'
  ],
  Uttarakhand: [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Mussoorie'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Kharagpur', 'Habra', 'Haldia'
  ],
  'Andaman and Nicobar Islands': [
    'Port Blair'
  ],
  Chandigarh: [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Sopore'
  ],
  Ladakh: [
    'Leh', 'Kargil'
  ],
  Lakshadweep: [
    'Kavaratti', 'Agatti', 'Andrott'
  ],
  Puducherry: [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam'
  ]
};

export const getStates = () => INDIAN_STATES;

export const getCitiesByState = (state) => {
  if (!state) return [];
  return CITIES_BY_STATE[state] || [];
};
