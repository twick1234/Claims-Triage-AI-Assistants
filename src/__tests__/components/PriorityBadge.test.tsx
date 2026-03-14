/**
 * Tests for src/components/PriorityBadge.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriorityBadge } from '@/components/PriorityBadge';

describe('PriorityBadge', () => {
  it('renders CRITICAL label', () => {
    render(<PriorityBadge priority="CRITICAL" />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('CRITICAL has red background class', () => {
    render(<PriorityBadge priority="CRITICAL" />);
    const el = screen.getByText('CRITICAL');
    expect(el.className).toMatch(/bg-red/);
  });

  it('renders HIGH label', () => {
    render(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('HIGH has orange background class', () => {
    render(<PriorityBadge priority="HIGH" />);
    const el = screen.getByText('HIGH');
    expect(el.className).toMatch(/bg-orange/);
  });

  it('renders MEDIUM label', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('MEDIUM has yellow background class', () => {
    render(<PriorityBadge priority="MEDIUM" />);
    const el = screen.getByText('MEDIUM');
    expect(el.className).toMatch(/bg-yellow/);
  });

  it('renders LOW label', () => {
    render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('LOW has green background class', () => {
    render(<PriorityBadge priority="LOW" />);
    const el = screen.getByText('LOW');
    expect(el.className).toMatch(/bg-green/);
  });

  it('renders PENDING label', () => {
    render(<PriorityBadge priority="PENDING" />);
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('applies sm size classes by default', () => {
    render(<PriorityBadge priority="HIGH" />);
    const el = screen.getByText('HIGH');
    expect(el.className).toMatch(/text-xs/);
  });

  it('applies md size classes when size="md"', () => {
    render(<PriorityBadge priority="HIGH" size="md" />);
    const el = screen.getByText('HIGH');
    expect(el.className).toMatch(/text-sm/);
  });
});
