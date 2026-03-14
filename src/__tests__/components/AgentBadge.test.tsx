/**
 * Tests for src/components/AgentBadge.tsx
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AgentBadge } from '@/components/AgentBadge';

describe('AgentBadge', () => {
  it('renders Grace label', () => {
    render(<AgentBadge agentId="grace" />);
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  it('renders Grace with blue (💙) emoji', () => {
    render(<AgentBadge agentId="grace" />);
    expect(screen.getByText('💙')).toBeInTheDocument();
  });

  it('Grace badge has blue background class', () => {
    const { container } = render(<AgentBadge agentId="grace" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/bg-blue/);
  });

  it('renders Swift label', () => {
    render(<AgentBadge agentId="swift" />);
    expect(screen.getByText('Swift')).toBeInTheDocument();
  });

  it('renders Swift with amber (⚡) emoji', () => {
    render(<AgentBadge agentId="swift" />);
    expect(screen.getByText('⚡')).toBeInTheDocument();
  });

  it('Swift badge has amber background class', () => {
    const { container } = render(<AgentBadge agentId="swift" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/bg-amber/);
  });

  it('renders Phoenix label', () => {
    render(<AgentBadge agentId="phoenix" />);
    expect(screen.getByText('Phoenix')).toBeInTheDocument();
  });

  it('renders Phoenix with fire (🔥) emoji', () => {
    render(<AgentBadge agentId="phoenix" />);
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('Phoenix badge has red background class', () => {
    const { container } = render(<AgentBadge agentId="phoenix" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/bg-red/);
  });

  it('renders Kara label', () => {
    render(<AgentBadge agentId="kara" />);
    expect(screen.getByText('Kara')).toBeInTheDocument();
  });

  it('renders Kara with book (📚) emoji', () => {
    render(<AgentBadge agentId="kara" />);
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<AgentBadge agentId="grace" showLabel={false} />);
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
    // Emoji still shows
    expect(screen.getByText('💙')).toBeInTheDocument();
  });

  it('applies lg size class', () => {
    const { container } = render(<AgentBadge agentId="swift" size="lg" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-base/);
  });

  it('human badge has violet background class', () => {
    const { container } = render(<AgentBadge agentId="human" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/bg-violet/);
  });
});
