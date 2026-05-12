import SkipButton from "@/components/SkipButton/SkipButton";
import { AuthService } from "@/lib/service";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

jest.mock("@/lib/service", () => ({
  AuthService: {
    updateOnboarding: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

const mockPush = jest.fn();
const mockApiKey = "test-api-key";

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
});

test("renders the button with correct text", () => {
  render(<SkipButton apiKey={mockApiKey} type="invite" />);
  expect(screen.getByText("Skip")).toBeInTheDocument();
  expect(screen.getByText(", Do it Later!")).toBeInTheDocument();
});

test("navigates to '/company_profile/invite_user' when type is 'business_unit'", async () => {
  (AuthService.updateOnboarding as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  render(<SkipButton apiKey={mockApiKey} type="business_unit" />);
  fireEvent.click(screen.getByText("Skip"));

  await waitFor(() => {
    expect(AuthService.updateOnboarding).toHaveBeenCalledWith(mockApiKey, "business_unit");
    expect(mockPush).toHaveBeenCalledWith("/company_profile/invite_user");
  });
});

test("navigates to '/home' when type is 'invite'", async () => {
  (AuthService.updateOnboarding as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  render(<SkipButton apiKey={mockApiKey} type="invite" />);
  fireEvent.click(screen.getByText("Skip"));

  await waitFor(() => {
    expect(AuthService.updateOnboarding).toHaveBeenCalledWith(mockApiKey, "invite");
    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});

test("navigates to '/company_profile/business_unit' when type is undefined (default)", async () => {
  (AuthService.updateOnboarding as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  render(<SkipButton apiKey={mockApiKey} type={undefined} />);
  fireEvent.click(screen.getByText("Skip"));

  await waitFor(() => {
    expect(AuthService.updateOnboarding).toHaveBeenCalledWith(mockApiKey, undefined);
    expect(mockPush).toHaveBeenCalledWith("/company_profile/business_unit");
  });
});

test("navigates to '/company_profile/business_unit' when type is 'plan' (default case)", async () => {
  (AuthService.updateOnboarding as jest.Mock).mockResolvedValueOnce({
    data: { success: true },
  });

  render(<SkipButton apiKey={mockApiKey} type="plan" />);
  fireEvent.click(screen.getByText("Skip"));

  await waitFor(() => {
    expect(AuthService.updateOnboarding).toHaveBeenCalledWith(mockApiKey, "plan");
    expect(mockPush).toHaveBeenCalledWith("/company_profile/business_unit");
  });
});

test("shows error toast when API returns success: false", async () => {
  (AuthService.updateOnboarding as jest.Mock).mockResolvedValueOnce({
    data: { success: false },
  });

  render(<SkipButton apiKey={mockApiKey} type="invite" />);
  fireEvent.click(screen.getByText("Skip"));

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      "Something went wrong, please try again later"
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});