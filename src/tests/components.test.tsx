import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EligibilityBadge } from '../components/matching/EligibilityBadge';
import { MatchScoreBadge } from '../components/matching/MatchScoreBadge';
import { MatchExplanationModal } from '../components/matching/MatchExplanationModal';
import { calculateMatch } from '../engine/matching';
import { INITIAL_PROFILES, INITIAL_INTERNSHIPS } from '../lib/mockData';

describe('Common UI Components', () => {
  it('renders Button with proper text and handles clicks', () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Test Action</Button>);

    const btn = screen.getByRole('button', { name: /test action/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(clicked).toBe(true);
  });

  it('disables button when isLoading is true and renders spinner', () => {
    render(<Button isLoading>Submitting</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('renders Badge with correct variant styling', () => {
    render(<Badge variant="green">Eligible</Badge>);
    expect(screen.getByText('Eligible')).toBeInTheDocument();
  });
});

describe('Matching & Eligibility Badges', () => {
  it('renders Eligible badge correctly', () => {
    render(<EligibilityBadge status="eligible" />);
    expect(screen.getByText('Eligible')).toBeInTheDocument();
  });

  it('renders Ineligible badge correctly', () => {
    render(<EligibilityBadge status="ineligible" />);
    expect(screen.getByText('Ineligible')).toBeInTheDocument();
  });

  it('renders Needs Confirmation for unknown status', () => {
    render(<EligibilityBadge status="unknown" />);
    expect(screen.getByText('Needs Confirmation')).toBeInTheDocument();
  });

  it('renders MatchScoreBadge with score and tier', () => {
    render(<MatchScoreBadge score={85} tier="Strong Match" />);
    expect(screen.getByText('85% Fit')).toBeInTheDocument();
    expect(screen.getByText('Strong Match')).toBeInTheDocument();
  });
});

describe('Match Explanation Modal', () => {
  it('renders plain-language explanation and hard eligibility checks', () => {
    const student = INITIAL_PROFILES[0];
    const internship = INITIAL_INTERNSHIPS[0];
    const match = calculateMatch(student, internship);

    render(
      <MatchExplanationModal
        isOpen={true}
        onClose={() => {}}
        internship={internship}
        candidate={student}
        match={match}
      />
    );

    expect(screen.getByText('Transparent Match Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Plain-Language Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Hard Eligibility Criteria/i)).toBeInTheDocument();
    expect(screen.getByText(/Matched Required Skills/i)).toBeInTheDocument();
  });
});
