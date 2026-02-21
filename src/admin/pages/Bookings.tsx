import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
  User,
  Calendar,
  Package,
  Mail,
  Phone,
  CreditCard,
  Wallet,
} from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@shared/components/ui/alert-dialog";
import StatusBadge from "../components/bookings/StatusBadge";
import PaymentStatusBadge from "../components/bookings/PaymentStatusBadge";
import BookingDetailsModal from "../components/bookings/BookingDetailsModal";
import { bookingsApi } from "../services/api";
import { Booking, BookingStatus, PaymentStatus, PaymentProvider } from "../types";
import { format } from "date-fns";
import { useToast } from "@/shared/hooks/use-toast";

const ITEMS_PER_PAGE = 20;

// ============================================================
// PROVIDER BADGE
// ============================================================

const ProviderBadge = ({
  provider,
}: {
  provider: PaymentProvider;
}) => {
  if (!provider) return <span className="text-muted-foreground text-xs">—</span>;

  const isKhalti = provider === "khalti";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isKhalti
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
      }`}
    >
      {isKhalti ? (
        <Wallet className="h-3 w-3" />
      ) : (
        <CreditCard className="h-3 w-3" />
      )}
      {isKhalti ? "Khalti" : "Razorpay"}
    </span>
  );
};

// ============================================================
// CURRENCY-AWARE AMOUNT FORMATTER
// ============================================================

const formatPaymentAmount = (
  amount: number | null | undefined,
  currency: string | null | undefined,
  provider: PaymentProvider
) => {
  if (!amount) return "—";
  const val = (amount / 100).toFixed(2);
  if (currency === "NPR") return `NPR ${val}`;
  return `₹${val}`;
};

// ============================================================
// BOOKINGS PAGE
// ============================================================

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "all"
  );
  const [paymentStatusFilter, setPaymentStatusFilter] = useState(
    searchParams.get("payment_status") || "all"
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1", 10)
  );
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(
    localStorage.getItem("bookings_show_filters") === "true"
  );
  const { toast } = useToast();

  // Sync filters → URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentStatusFilter !== "all") params.payment_status = paymentStatusFilter;
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    if (currentPage > 1) params.page = currentPage.toString();
    setSearchParams(params, { replace: true });
  }, [searchQuery, statusFilter, paymentStatusFilter, dateFrom, dateTo, currentPage, setSearchParams]);

  useEffect(() => {
    localStorage.setItem("bookings_show_filters", showFilters.toString());
  }, [showFilters]);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    try {
      const response = await bookingsApi.search({
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? (statusFilter as BookingStatus) : undefined,
        payment_status:
          paymentStatusFilter !== "all"
            ? (paymentStatusFilter as PaymentStatus)
            : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        limit: ITEMS_PER_PAGE,
        skip,
      });
      setBookings(response.data.bookings);
      setTotalCount(response.data.total);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter, paymentStatusFilter, dateFrom, dateTo, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailsOpen(true);
  };

  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;

    const booking = bookings.find((b) => b._id === deleteBookingId);
    if (booking?.payment_status === "paid") {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete a paid booking. Please process a refund first.",
        variant: "destructive",
      });
      setDeleteBookingId(null);
      return;
    }

    try {
      await bookingsApi.delete(deleteBookingId);
      toast({ title: "Deleted", description: "Booking deleted successfully." });
      fetchBookings();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast({
        title: "Error",
        description: err.response?.data?.detail || "Could not delete booking.",
        variant: "destructive",
      });
    } finally {
      setDeleteBookingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl sm:text-3xl font-bold break-words">
            Bookings
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
            {totalCount} total bookings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="md:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            onClick={fetchBookings}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`bg-card rounded-xl border p-4 ${!showFilters ? "hidden md:block" : ""}`}
      >
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 h-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Booking Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Payment Status
              </label>
              <Select
                value={paymentStatusFilter}
                onValueChange={setPaymentStatusFilter}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="payment_pending">Payment Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                From Date
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                To Date
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSearch}
              size="sm"
              className="h-10 gradient-primary text-white shadow-rose [&_svg]:text-white [&_svg]:stroke-white hover:opacity-90 transition-opacity"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                size="sm"
                variant="outline"
                className="h-10 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP TABLE                                                  */}
      {/* ============================================================ */}
      <div className="hidden lg:block bg-card rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead className="min-w-[180px]">Customer</TableHead>
              <TableHead className="min-w-[150px]">Service</TableHead>
              <TableHead className="w-28">Date</TableHead>
              <TableHead className="w-32">Booking</TableHead>
              <TableHead className="w-36">Payment</TableHead>
              <TableHead className="w-28">Provider</TableHead>
              <TableHead className="w-32">Amount</TableHead>
              <TableHead className="w-28">Created</TableHead>
              <TableHead className="text-right w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-10 text-muted-foreground"
                >
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b._id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    #{b._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{b.service}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.package || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{b.date}</TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={b.payment_status} />
                  </TableCell>
                  <TableCell>
                    <ProviderBadge provider={b.payment_provider ?? null} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {formatPaymentAmount(
                          b.payment_amount,
                          b.payment_currency,
                          b.payment_provider ?? null
                        )}
                      </p>
                      {b.payment_method && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {b.payment_method}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(b.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(b)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteBookingId(b._id)}
                        disabled={b.payment_status === "paid"}
                        title={
                          b.payment_status === "paid"
                            ? "Cannot delete paid booking"
                            : "Delete booking"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ============================================================ */}
      {/* MOBILE / TABLET CARD VIEW                                      */}
      {/* ============================================================ */}
      <div className="lg:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-10">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No bookings found</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div
              key={b._id}
              className="bg-card rounded-lg border p-3 sm:p-4 space-y-3 hover:border-primary/50 transition-colors"
              onClick={() => handleViewDetails(b)}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {b.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{b._id.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={b.status} className="flex-shrink-0" />
                  <PaymentStatusBadge
                    status={b.payment_status}
                    className="flex-shrink-0"
                  />
                </div>
              </div>

              {/* Amount + Provider */}
              {b.payment_amount && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="flex-shrink-0">
                    <ProviderBadge provider={b.payment_provider ?? null} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {formatPaymentAmount(
                        b.payment_amount,
                        b.payment_currency,
                        b.payment_provider ?? null
                      )}
                    </p>
                    {b.payment_method && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {b.payment_method}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{b.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{b.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground min-w-0">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">{b.service}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{b.date}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 sm:h-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(b);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 sm:h-9"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteBookingId(b._id);
                  }}
                  disabled={b.payment_status === "paid"}
                >
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 sm:p-4 bg-card rounded-xl border">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 sm:px-3 text-xs sm:text-sm font-medium min-w-[60px] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBooking(null);
        }}
        onStatusUpdate={() => fetchBookings()}
        onRefresh={fetchBookings}
      />

      <AlertDialog
        open={!!deleteBookingId}
        onOpenChange={() => setDeleteBookingId(null)}
      >
        <AlertDialogContent className="w-[90vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The booking will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="m-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBooking}
              className="bg-destructive hover:bg-destructive/90 m-0"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Bookings;