import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ShopList from "./pages/shops/ShopList";
import ShopDetail from "./pages/shops/ShopDetail";
import CreateBooking from "./pages/bookings/CreateBooking";
import MyBookings from "./pages/customer/MyBookings";
import BarberDashboard from "./pages/barber/Dashboard";
import ShopForm from "./pages/barber/ShopForm";
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/shops" component={ShopList} />
      <Route path="/shops/:id" component={ShopDetail} />
      
      {/* Auth */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Customer Routes */}
      <Route path="/book/:shopId" component={CreateBooking} />
      <Route path="/my-bookings" component={MyBookings} />

      {/* Barber Routes */}
      <Route path="/barber/dashboard" component={BarberDashboard} />
      <Route path="/barber/shop" component={ShopForm} />

      {/* Admin Route */}
      <Route path="/admin" component={AdminDashboard} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
