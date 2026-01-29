import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';
import { ViewState } from '../types';

describe('Home Component', () => {
    it('renders the main headline', () => {
        const setView = vi.fn();
        render(<Home setView={setView} />);

        expect(screen.getByText(/AI 保險理賠顧問/i)).toBeInTheDocument();
        expect(screen.getByText(/秒懂繁雜條款，守護您的權益/i)).toBeInTheDocument();
    });

    it('renders the CTA button and handles click', () => {
        const setView = vi.fn();
        render(<Home setView={setView} />);

        const ctaButton = screen.getByText(/立即免費諮詢/i);
        expect(ctaButton).toBeInTheDocument();

        fireEvent.click(ctaButton);
        expect(setView).toHaveBeenCalledWith(ViewState.DEMO);
    });

    it('renders team section', () => {
        const setView = vi.fn();
        render(<Home setView={setView} />);

        expect(screen.getByText(/製作團隊與特別感謝/i)).toBeInTheDocument();
        expect(screen.getByText(/莊浚/i)).toBeInTheDocument();
    });
});
