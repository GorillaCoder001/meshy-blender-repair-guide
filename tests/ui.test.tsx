import React from 'react';
import { beforeEach,describe,it,expect,vi } from 'vitest';
import { render,screen,fireEvent,within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { Checklist } from '../src/pages/LibraryPages';
import { ComparisonDiagram } from '../src/components/ComparisonDiagram';
import { RepairTree } from '../src/components/RepairTree';
beforeEach(()=>{localStorage.clear();location.hash='home';vi.spyOn(window,'scrollTo').mockImplementation(()=>{});});
describe('User workflows',()=>{
  it('branches through the repair decision tree and can return to a prior question',async()=>{
    const user=userEvent.setup();render(<RepairTree/>);
    await user.click(screen.getByRole('button',{name:'No · decorative / organic work'}));
    await user.click(screen.getByRole('button',{name:'Usable · local defects remain'}));
    await user.click(screen.getByRole('button',{name:'Designed cavity with walls'}));
    expect(screen.getByRole('heading',{name:'Preserve the cavity; verify its walls'})).toBeTruthy();
    await user.click(screen.getByRole('button',{name:'Previous question'}));
    expect(screen.getByRole('heading',{name:'What boundary does the mesh have?'})).toBeTruthy();
  });
  it('completes floating hair diagnosis with an actual contact decision',async()=>{
    location.hash='diagnose/floating'; const user=userEvent.setup();render(<App/>);
    await user.click(screen.getByRole('button',{name:'Continue to observations'}));
    await user.selectOptions(screen.getByLabelText('Does the detached piece belong to the design?'),'keep');
    await user.selectOptions(screen.getByLabelText('Is there real material contact?'),'separate');
    await user.click(screen.getByRole('button',{name:'Build my repair path'}));
    expect(screen.getByRole('heading',{name:'Create a real attachment before union'})).toBeTruthy();
    expect(screen.getByText(/A union cannot bridge a genuine gap/)).toBeTruthy();
    expect(screen.getByText('Suggested trial range:',{exact:false})).toBeTruthy();
  });
  it('prevents calculation with missing physical size',async()=>{
    location.hash='advisor';const user=userEvent.setup();render(<App/>);
    await user.clear(screen.getByLabelText('Z dimension in millimetres'));
    await user.click(screen.getByRole('button',{name:'Continue to observations'}));
    expect(within(screen.getByRole('alert')).getByText(/Z must be greater than/)).toBeTruthy();
    expect(screen.queryByRole('button',{name:'Build my repair path'})).toBeNull();
  });
  it('searches globally and routes to the selected content',async()=>{
    const user=userEvent.setup();render(<App/>);const field=screen.getByLabelText('Search all content');
    await user.type(field,'voxel');fireEvent.submit(field.closest('form')!);
    expect(await screen.findByRole('heading',{name:'Results for “voxel”'})).toBeTruthy();
    await user.click(screen.getByRole('link',{name:/Tool Voxel Remesh/}));
    expect(await screen.findByText('PRACTICAL STARTING PROCEDURE')).toBeTruthy();
  });
  it('retains checklist progress across mounts and confirms reset',async()=>{
    const user=userEvent.setup();const view=render(<Checklist/>);
    await user.click(screen.getByLabelText('Original Meshy export preserved'));
    view.unmount();render(<Checklist/>);
    expect((screen.getByLabelText('Original Meshy export preserved') as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByRole('button',{name:'Reset checklist'}));
    expect((screen.getByLabelText('Original Meshy export preserved') as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByRole('button',{name:'Clear progress'}));
    expect((screen.getByLabelText('Original Meshy export preserved') as HTMLInputElement).checked).toBe(false);
  });
  it('tolerates corrupted local storage',()=>{
    localStorage.setItem('created3d-repair-checklist-v1','{"backup-export":"invalid"}');render(<Checklist/>);
    expect((screen.getByLabelText('Original Meshy export preserved') as HTMLInputElement).checked).toBe(false);
  });
  it('opens navigation and closes it on Escape',async()=>{
    const user=userEvent.setup();render(<App/>);const menu=screen.getByRole('button',{name:'Open navigation'});
    await user.click(menu);expect(menu.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{Escape}');expect(menu.getAttribute('aria-expanded')).toBe('false');
  });
  it('expands original source metadata and changes teaching mode',async()=>{
    location.hash='tools/solidify';const user=userEvent.setup();render(<App/>);
    await user.selectOptions(screen.getByLabelText('Learning mode'),'advanced');
    expect(screen.getByRole('heading',{name:'Topology & tradeoffs'})).toBeTruthy();
    await user.click(screen.getByText('Why this guidance?'));
    expect(screen.getByRole('link',{name:/Blender Manual · Solidify Modifier/})).toBeTruthy();
    expect(screen.getAllByText(/Accessed 2026-10-16 · Blender 5.2 LTS/).length).toBeGreaterThan(0);
  });
  it('switches concept diagrams without claiming to repair a file',async()=>{
    const user=userEvent.setup();render(<ComparisonDiagram kind="shell"/>);
    await user.click(screen.getByRole('button',{name:'Wall volume + cavity'}));
    expect(screen.getByRole('button',{name:'Wall volume + cavity'}).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('cavity');
  });
});
