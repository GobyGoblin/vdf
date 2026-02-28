import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import { ProtectedRoute } from "@/components/layout";

// Marketing Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Solutions from "./pages/Solutions";
import Insights from "./pages/Insights";
import InsightDetail from "./pages/InsightDetail";
import ForCompanies from "./pages/ForCompanies";
import ForWorkers from "./pages/ForWorkers";
import Contact from "./pages/Contact";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Candidate Pages
import CandidateDashboard from "./pages/candidate/Dashboard";
import CandidateProfile from "./pages/candidate/Profile";
import CandidateDocuments from "./pages/candidate/Documents";
import CandidateReviewStatus from "./pages/candidate/ReviewStatus";
import CandidatePricing from "./pages/candidate/Pricing";
import CandidateInterviews from "./pages/candidate/Interviews";

// Employer Pages
import EmployerDashboard from "./pages/employer/Dashboard";
import EmployerOnboarding from "./pages/employer/Onboarding";
import EmployerTalentPool from "./pages/employer/TalentPool";
import EmployerCandidateDetail from "./pages/employer/CandidateDetail";
import EmployerCandidateManagement from "./pages/employer/CandidateManagement";
import EmployerQuotes from "./pages/employer/MyQuotes";
import EmployerQuoteOptions from "./pages/employer/QuoteOptions";
import EmployerQuotePayment from "./pages/employer/QuotePayment";
import EmployerQuoteReceipt from "./pages/employer/QuoteReceipt";
import EmployerTalentDemands from "./pages/employer/TalentDemands";
import EmployerInterviews from "./pages/employer/Interviews";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import StaffReviewQueue from "./pages/staff/ReviewQueue";
import StaffReviewDetail from "./pages/staff/ReviewDetail";
import StaffCompanyReviewDetail from "./pages/staff/CompanyReviewDetail";
import StaffUsers from "./pages/staff/Users";
import StaffDomainsManagement from "./pages/staff/DomainsManagement";
import StaffUserDetail from "./pages/staff/UserDetail";
import StaffQuoteRequests from "./pages/staff/QuoteRequests";
import StaffTalentDemands from './pages/staff/TalentDemands';
import StaffTalentDemandFulfillment from './pages/staff/TalentDemandFulfillment';
import StaffCandidatePipeline from './pages/staff/CandidatePipeline';

// Shared Pages
import VideoCallRoom from './pages/shared/VideoCallRoom';

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminInsights from "./pages/admin/Insights";
import AdminInsightEdit from "./pages/admin/InsightEdit";
import AdminEmployers from "./pages/admin/Employers";
import AdminUsers from "./pages/admin/Users";
import AdminAudit from "./pages/admin/Audit";
import AdminRetention from "./pages/admin/Retention";
import AdminWorkers from "./pages/admin/Workers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Marketing */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:slug" element={<InsightDetail />} />
          <Route path="/for-companies" element={<ForCompanies />} />
          <Route path="/for-workers" element={<ForWorkers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Candidate */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/documents" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDocuments /></ProtectedRoute>} />
          <Route path="/candidate/review-status" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateReviewStatus /></ProtectedRoute>} />
          <Route path="/candidate/pricing" element={<ProtectedRoute allowedRoles={['candidate']}><CandidatePricing /></ProtectedRoute>} />
          <Route path="/candidate/interviews" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateInterviews /></ProtectedRoute>} />

          {/* Employer */}
          <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/onboarding" element={<ProtectedRoute allowedRoles={['employer']}><EmployerOnboarding /></ProtectedRoute>} />
          <Route path="/employer/talent-pool" element={<ProtectedRoute allowedRoles={['employer']}><EmployerTalentPool /></ProtectedRoute>} />
          <Route path="/employer/talent-pool/:candidateId" element={<ProtectedRoute allowedRoles={['employer']}><EmployerCandidateDetail /></ProtectedRoute>} />
          <Route path="/employer/candidates" element={<ProtectedRoute allowedRoles={['employer']}><EmployerCandidateManagement /></ProtectedRoute>} />
          <Route path="/employer/quotes" element={<ProtectedRoute allowedRoles={['employer']}><EmployerQuotes /></ProtectedRoute>} />
          <Route path="/employer/quotes/:id" element={<ProtectedRoute allowedRoles={['employer']}><EmployerQuoteOptions /></ProtectedRoute>} />
          <Route path="/employer/quotes/:id/payment" element={<ProtectedRoute allowedRoles={['employer']}><EmployerQuotePayment /></ProtectedRoute>} />
          <Route path="/employer/quotes/:id/receipt" element={<ProtectedRoute allowedRoles={['employer']}><EmployerQuoteReceipt /></ProtectedRoute>} />
          <Route path="/employer/talent-demands" element={<ProtectedRoute allowedRoles={['employer']}><EmployerTalentDemands /></ProtectedRoute>} />
          <Route path="/employer/interviews" element={<ProtectedRoute allowedRoles={['employer']}><EmployerInterviews /></ProtectedRoute>} />

          {/* Staff */}
          <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />
          <Route path="/staff/review-queue" element={<ProtectedRoute allowedRoles={['staff']}><StaffReviewQueue /></ProtectedRoute>} />
          <Route path="/staff/reviews/:candidateId" element={<ProtectedRoute allowedRoles={['staff']}><StaffReviewDetail /></ProtectedRoute>} />
          <Route path="/staff/companies/:companyId" element={<ProtectedRoute allowedRoles={['staff']}><StaffCompanyReviewDetail /></ProtectedRoute>} />
          <Route path="/staff/talent-demands" element={<ProtectedRoute allowedRoles={['staff']}><StaffTalentDemands /></ProtectedRoute>} />
          <Route path="/staff/talent-demands/:id" element={<ProtectedRoute allowedRoles={['staff']}><StaffTalentDemandFulfillment /></ProtectedRoute>} />
          <Route path="/staff/users" element={<ProtectedRoute allowedRoles={['staff']}><StaffUsers /></ProtectedRoute>} />
          <Route path="/staff/users/:userId" element={<ProtectedRoute allowedRoles={['staff']}><StaffUserDetail /></ProtectedRoute>} />
          <Route path="/staff/domains" element={<ProtectedRoute allowedRoles={['staff']}><StaffDomainsManagement /></ProtectedRoute>} />
          <Route path="/staff/quotes" element={<ProtectedRoute allowedRoles={['staff']}><StaffQuoteRequests /></ProtectedRoute>} />
          <Route path="/staff/pipeline" element={<ProtectedRoute allowedRoles={['staff']}><StaffCandidatePipeline /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/insights" element={<ProtectedRoute allowedRoles={['admin']}><AdminInsights /></ProtectedRoute>} />
          <Route path="/admin/insights/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminInsightEdit /></ProtectedRoute>} />
          <Route path="/admin/insights/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminInsightEdit /></ProtectedRoute>} />
          <Route path="/admin/employers" element={<ProtectedRoute allowedRoles={['admin']}><AdminEmployers /></ProtectedRoute>} />
          <Route path="/admin/workers" element={<ProtectedRoute allowedRoles={['admin']}><AdminWorkers /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><AdminAudit /></ProtectedRoute>} />
          <Route path="/admin/retention" element={<ProtectedRoute allowedRoles={['admin']}><AdminRetention /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/meeting/:meetingId" element={<ProtectedRoute allowedRoles={['employer', 'candidate', 'staff']}><VideoCallRoom /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
